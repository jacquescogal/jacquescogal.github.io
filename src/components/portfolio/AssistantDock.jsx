import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowUp,
  IconBulb,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  addChatMessage,
  setAssistantPrompt,
  setThinking,
} from "../../store/chatbotStateSlice";
import { getChatSuggestions, streamChatMessage } from "../../api/chatApi";
import { linkTextParser } from "../../utils/Links";

const STREAM_STAGES = [
  { key: "message_received", label: "Message received" },
  { key: "fetching_related_sources", label: "Fetching related sources" },
  { key: "crafting_response", label: "Crafting response" },
];
const STREAM_STAGE_COLLAPSE_DELAY_MS = 900;

const INITIAL_STREAM_STATE = {
  activeStage: null,
  message: "",
  started: false,
  collapsed: false,
};

const getStageKey = (stage) => {
  if (typeof stage === "string") return stage;
  return stage?.stage || stage?.id || null;
};

const AssistantDock = ({ onNavigate }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Jacques AI workspace"
        className="sticky top-20 hidden h-[calc(100vh-6rem)] min-h-0 xl:block"
      >
        <AssistantPanel onNavigate={onNavigate} />
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {!sheetOpen && (
          <SheetTrigger
            className={cn(
              buttonVariants(),
              "fixed bottom-4 right-4 z-[1200] gap-2 rounded-full bg-slate-950 text-white shadow-lg hover:bg-slate-800 sm:bottom-5 sm:right-5 xl:hidden"
            )}
            onClick={() => setSheetOpen(true)}
          >
            <IconSparkles className="size-4" />
            Ask Jacques AI
          </SheetTrigger>
        )}
        <SheetContent className="w-full p-0 sm:max-w-md" side="right">
          <SheetHeader className="sr-only">
            <SheetTitle>Jacques AI workspace</SheetTitle>
            <SheetDescription>Chat with the portfolio assistant.</SheetDescription>
          </SheetHeader>
          <div
            role="complementary"
            aria-label="Jacques AI workspace"
            className="h-full min-h-0 p-2 sm:p-3"
          >
            <AssistantPanel
              onNavigate={(target) => {
                onNavigate?.(target);
                setSheetOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const AssistantPanel = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.chatbotState.chatHistory);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const assistantPrompt = useSelector((state) => state.chatbotState.assistantPrompt);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [streamState, setStreamState] = useState(INITIAL_STREAM_STATE);
  const chatHistoryRef = useRef(null);
  const isDeliveringRef = useRef(false);
  const stageCollapseTimerRef = useRef(null);
  const streamedMessageRef = useRef("");

  const clearStageCollapseTimer = () => {
    if (stageCollapseTimerRef.current) {
      clearTimeout(stageCollapseTimerRef.current);
      stageCollapseTimerRef.current = null;
    }
  };

  const scheduleStageCollapse = () => {
    clearStageCollapseTimer();
    stageCollapseTimerRef.current = setTimeout(() => {
      setStreamState((current) => (
        current.started
          ? { ...current, collapsed: true }
          : current
      ));
    }, STREAM_STAGE_COLLAPSE_DELAY_MS);
  };

  useEffect(() => () => {
    clearStageCollapseTimer();
  }, []);

  useEffect(() => {
    if (assistantPrompt) {
      setMessage(assistantPrompt);
      dispatch(setAssistantPrompt(""));
    }
  }, [assistantPrompt, dispatch]);

  useEffect(() => {
    const chatHistoryElement = chatHistoryRef.current;
    if (!chatHistoryElement) return;

    chatHistoryElement.scrollTo({
      top: chatHistoryElement.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory, isThinking, suggestions, showSuggestions, streamState]);

  const deliverMessage = async (nextMessage = message) => {
    const trimmed = nextMessage.trim();
    if (!trimmed || isThinking || isDeliveringRef.current) return;

    isDeliveringRef.current = true;
    dispatch(addChatMessage({ message: trimmed, entity: "USER", links: [] }));
    setMessage("");
    setSuggestions([]);
    setShowSuggestions(false);
    dispatch(setThinking(true));
    streamedMessageRef.current = "";
    clearStageCollapseTimer();
    setStreamState({
      ...INITIAL_STREAM_STATE,
      started: true,
    });

    let streamOpened = false;

    try {
      await streamChatMessage(chatHistory, trimmed, {
        onStage: (stage) => {
          const stageKey = getStageKey(stage);
          streamOpened = true;
          setStreamState((current) => ({
            ...current,
            activeStage: stageKey,
            started: true,
            collapsed: false,
          }));
          if (stageKey === "crafting_response") {
            scheduleStageCollapse();
          } else {
            clearStageCollapseTimer();
          }
        },
        onDelta: (delta) => {
          streamOpened = true;
          streamedMessageRef.current += delta;
          setStreamState((current) => ({
            ...current,
            message: streamedMessageRef.current,
            started: true,
            collapsed: current.collapsed,
          }));
        },
        onComplete: () => {
          streamOpened = true;
          clearStageCollapseTimer();
          const parsedMessage = linkTextParser(streamedMessageRef.current);
          dispatch(
            addChatMessage({
              entity: "AI",
              ...parsedMessage,
            })
          );
          streamedMessageRef.current = "";
          setStreamState(INITIAL_STREAM_STATE);
        },
        onError: (error) => {
          throw new Error(error?.message || error?.error || "Assistant stream failed");
        },
      });
    } catch (error) {
      clearStageCollapseTimer();
      setStreamState(INITIAL_STREAM_STATE);
      dispatch(
        addChatMessage({
          entity: "SYSTEM",
          message: `error: ${error}`,
          links: [],
        })
      );
    } finally {
      isDeliveringRef.current = false;
      dispatch(setThinking(false));
    }
  };

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    try {
      const nextSuggestions = await getChatSuggestions(chatHistory);
      setSuggestions(nextSuggestions);
    } catch (error) {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <Card className="h-full min-h-0 gap-3 border-slate-200 bg-white/95 py-0 shadow-sm">
      <CardHeader className="gap-3 border-b px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2 gap-1 bg-emerald-50 text-emerald-700">
              <IconSparkles className="size-3" />
              Portfolio AI
            </Badge>
            <CardTitle className="text-base">Jacques AI workspace</CardTitle>
          </div>
        </div>
        <p className="text-sm leading-5 text-slate-600">
          Ask focused questions about Jacques' work, projects, and fit.
        </p>
      </CardHeader>

      <CardContent className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-3 overflow-hidden p-2 sm:p-3">
        <div
          ref={chatHistoryRef}
          className="min-h-0 overflow-y-auto overscroll-contain rounded-xl border bg-slate-50"
        >
          <div className="space-y-3 p-3">
            {chatHistory.map((chatMessage, index) => (
              <AssistantMessage
                key={`${chatMessage.entity}-${index}`}
                chatMessage={chatMessage}
                onNavigate={onNavigate}
              />
            ))}
            {streamState.started && (
              <AssistantStreamingMessage streamState={streamState} />
            )}
            {showSuggestions && (
              <div className="space-y-2 rounded-xl border bg-white p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <IconBulb className="size-4 text-amber-500" />
                  Suggested questions
                </div>
                {loadingSuggestions ? (
                  <p className="text-sm text-slate-500">Loading suggestions...</p>
                ) : suggestions.length ? (
                  <div className="space-y-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        className="h-auto w-full justify-start whitespace-normal text-left"
                        onClick={() => deliverMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No suggestions available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-600"
              disabled={loadingSuggestions || isThinking}
              onClick={loadSuggestions}
            >
              <IconBulb className="size-4" />
              Suggestions
            </Button>
          </div>
          <Separator />
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              deliverMessage();
            }}
          >
            <Textarea
              aria-label="Message Jacques AI"
              className="h-12 min-h-12 min-w-0 flex-1 resize-none bg-white"
              placeholder="Ask about experience, projects, or fit..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  deliverMessage();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="size-12 shrink-0 bg-slate-950 text-white hover:bg-slate-800"
              disabled={!message.trim() || isThinking}
            >
              <IconArrowUp className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

const AssistantStreamingMessage = ({ streamState }) => {
  const activeStageIndex = STREAM_STAGES.findIndex((stage) => stage.key === streamState.activeStage);
  const visibleStageIndex = activeStageIndex >= 0 ? activeStageIndex : 0;
  const activeStageLabel = STREAM_STAGES[visibleStageIndex]?.label || "Message received";
  const visibleStages = STREAM_STAGES.slice(0, visibleStageIndex + 1);

  return (
    <div className="mr-auto max-w-[88%] rounded-xl border bg-white px-3 py-2.5 text-sm leading-6 text-slate-700 shadow-sm">
      {streamState.collapsed ? (
        <div
          data-stream-collapsed-stage
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
        >
          <span
            data-stream-stage-dot
            className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]"
            aria-hidden="true"
          />
          <span>{activeStageLabel}</span>
        </div>
      ) : (
        <div className="space-y-0.5">
          {visibleStages.map((stage, index) => {
            const isActive = stage.key === streamState.activeStage;
            const isLast = index === visibleStages.length - 1;

            return (
              <div
                key={stage.key}
                className={cn(
                  "grid grid-cols-[14px_minmax(0,1fr)] gap-2 text-xs font-medium",
                  isActive ? "text-emerald-700" : "text-slate-500"
                )}
              >
                <span className="relative flex justify-center pt-1.5" aria-hidden="true">
                  <span
                    data-stream-stage-dot
                    className={cn(
                      "relative z-10 h-2.5 w-2.5 rounded-full border-2 border-white",
                      isActive
                        ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.16)]"
                        : "bg-slate-300"
                    )}
                  />
                  {!isLast && (
                    <span className="absolute top-4 h-[calc(100%+0.25rem)] w-px bg-slate-200" />
                  )}
                </span>
                <span className="min-w-0">{stage.label}</span>
              </div>
            );
          })}
        </div>
      )}
      {streamState.message && (
        <p className="mt-2 whitespace-pre-wrap break-words text-slate-700 [overflow-wrap:anywhere]">
          {streamState.message}
        </p>
      )}
    </div>
  );
};

const AssistantMessage = ({ chatMessage, onNavigate }) => {
  if (chatMessage.entity === "SYSTEM") {
    return (
      <div className="break-words rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 [overflow-wrap:anywhere]">
        {chatMessage.message}
      </div>
    );
  }

  if (chatMessage.entity === "USER") {
    return (
      <div className="ml-auto max-w-[85%] break-words rounded-xl bg-slate-950 px-3 py-2 text-sm text-white [overflow-wrap:anywhere]">
        {chatMessage.message}
      </div>
    );
  }

  return (
    <div className="mr-auto max-w-[88%] rounded-xl border bg-white px-3 py-2 text-sm leading-6 text-slate-700">
      <p className="break-words [overflow-wrap:anywhere]">{chatMessage.message}</p>
      {chatMessage.links?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chatMessage.links.map((link, index) =>
            link.type === "internal" ? (
              <Button
                key={`${link.where}-${index}`}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onNavigate?.(link.where)}
              >
                {link.text}
              </Button>
            ) : (
              <a
                key={`${link.where}-${index}`}
                href={link.where}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
              >
                {link.text}
                <IconExternalLink className="size-3" />
              </a>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantDock;
