import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowUp,
  IconBulb,
  IconExternalLink,
} from "@tabler/icons-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { BoardShell, BoardRow } from "./ServiceBoard";
import { cn } from "@/lib/utils";
import remarkGfm from "remark-gfm";
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
const MAX_CHAT_MESSAGE_LENGTH = 500;

const INITIAL_STREAM_STATE = {
  activeStage: null,
  message: "",
  started: false,
  collapsed: false,
};

const clampChatMessage = (value) => String(value || "").slice(0, MAX_CHAT_MESSAGE_LENGTH);

const markdownComponents = {
  p: ({ ...props }) => (
    <p className="m-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]" {...props} />
  ),
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  em: ({ ...props }) => <em className="italic" {...props} />,
  ul: ({ ...props }) => <ul className="my-1.5 list-disc space-y-1 pl-4" {...props} />,
  ol: ({ ...props }) => <ol className="my-1.5 list-decimal space-y-1 pl-4" {...props} />,
  li: ({ ...props }) => <li className="break-words [overflow-wrap:anywhere]" {...props} />,
  a: ({ ...props }) => (
    <a
      className="font-semibold underline underline-offset-2"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  code: ({ inline, ...props }) => (
    <code
      className={cn(
        "break-words rounded-unit border border-amber/20 bg-void-deep px-1 py-0.5 font-console text-[0.78em] text-amber [overflow-wrap:anywhere]",
        !inline && "block whitespace-pre-wrap p-2"
      )}
      {...props}
    />
  ),
  pre: ({ ...props }) => (
    <pre
      className="my-2 overflow-x-auto rounded-unit border border-amber/20 bg-void-deep p-2 font-console text-[0.68rem] text-bone/85 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  blockquote: ({ ...props }) => (
    <blockquote className="my-1.5 border-l-2 border-amber pl-3" {...props} />
  ),
};

const MessageMarkdown = ({ children, className, tone = "default" }) => (
  <div
    className={cn(
      "space-y-1 break-words [overflow-wrap:anywhere]",
      tone === "inverse" &&
        "[&_code]:border-amber/25 [&_code]:bg-amber/10 [&_code]:text-amber [&_a]:text-amber",
      className
    )}
  >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  </div>
);

const getStageKey = (stage) => {
  if (typeof stage === "string") return stage;
  return stage?.stage || stage?.id || null;
};

const isGitHubUrl = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname === "github.com" || hostname.endsWith(".github.com");
  } catch {
    return false;
  }
};

const AssistantDock = ({ hideMobileTrigger = false, onNavigate, onOpenProject, onAchievement }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Jacques AI workspace"
        className="sticky top-[4.25rem] hidden h-[calc(100vh-5.5rem)] min-h-0 lg:block"
      >
        <AssistantPanel
          onNavigate={onNavigate}
          onOpenProject={onOpenProject}
          onAchievement={onAchievement}
        />
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        {!sheetOpen && !hideMobileTrigger && (
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "default" }),
              "fixed bottom-4 right-4 z-[1200] h-11 gap-2 px-4 shadow-lift sm:bottom-5 sm:right-5 lg:hidden"
            )}
            onClick={() => setSheetOpen(true)}
          >
            <span
              aria-hidden="true"
              className="flex size-4 items-center justify-center border-2 border-[#17110A]"
            >
              <span className="size-1.5 bg-[#17110A]" />
            </span>
            Ask Jacques AI
          </SheetTrigger>
        )}
        <SheetContent className="w-full p-0 sm:max-w-md" side="right" showCloseButton={false}>
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
              onOpenProject={onOpenProject}
              onAchievement={onAchievement}
              onNavigate={(target) => {
                onNavigate?.(target);
                setSheetOpen(false);
              }}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

const AssistantPanel = ({ onNavigate, onOpenProject, onAchievement, onClose }) => {
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.chatbotState.chatHistory);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const assistantPrompt = useSelector((state) => state.chatbotState.assistantPrompt);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsMenuOpen, setSuggestionsMenuOpen] = useState(false);
  const [streamState, setStreamState] = useState(INITIAL_STREAM_STATE);
  const chatHistoryRef = useRef(null);
  const isDeliveringRef = useRef(false);
  const suggestionCacheRef = useRef({ aiMessageCount: null, suggestions: [] });
  const stageCollapseTimerRef = useRef(null);
  const streamedMessageRef = useRef("");
  const aiMessageCount = chatHistory.filter((chatMessage) => chatMessage.entity === "AI").length;

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
    if (
      suggestionCacheRef.current.aiMessageCount !== null &&
      suggestionCacheRef.current.aiMessageCount !== aiMessageCount
    ) {
      suggestionCacheRef.current = { aiMessageCount: null, suggestions: [] };
      setSuggestions([]);
    }
  }, [aiMessageCount]);

  useEffect(() => {
    if (assistantPrompt) {
      setMessage(clampChatMessage(assistantPrompt));
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
  }, [chatHistory, isThinking, streamState]);

  const deliverMessage = async (nextMessage = message) => {
    const trimmed = clampChatMessage(nextMessage).trim();
    if (!trimmed || isThinking || isDeliveringRef.current) return;

    isDeliveringRef.current = true;
    onAchievement?.("first-contact");
    dispatch(addChatMessage({ message: trimmed, entity: "USER", links: [] }));
    setMessage("");
    setSuggestionsMenuOpen(false);
    dispatch(setThinking(true));
    streamedMessageRef.current = "";
    clearStageCollapseTimer();
    setStreamState({
      ...INITIAL_STREAM_STATE,
      started: true,
    });

    try {
      await streamChatMessage(chatHistory, trimmed, {
        onStage: (stage) => {
          const stageKey = getStageKey(stage);
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
          streamedMessageRef.current += delta;
          setStreamState((current) => ({
            ...current,
            message: streamedMessageRef.current,
            started: true,
            collapsed: current.collapsed,
          }));
        },
        onComplete: () => {
          clearStageCollapseTimer();
          const parsedMessage = linkTextParser(streamedMessageRef.current);
          if (/swim/i.test(parsedMessage.message)) {
            onAchievement?.("outside-the-code");
          }
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
    if (suggestionsMenuOpen) {
      setSuggestionsMenuOpen(false);
      return;
    }

    setSuggestionsMenuOpen(true);
    onAchievement?.("prompted-path");
    if (suggestionCacheRef.current.aiMessageCount === aiMessageCount) {
      setSuggestions(suggestionCacheRef.current.suggestions);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const nextSuggestions = await getChatSuggestions(chatHistory);
      setSuggestions(nextSuggestions);
      suggestionCacheRef.current = {
        aiMessageCount,
        suggestions: nextSuggestions,
      };
    } catch (error) {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-unit border border-amber/20 bg-panel-1">
      {/* The interchange's own nameplate. */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-amber/20 bg-panel-3 px-3 py-2.5">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center border-2 border-amber bg-void-deep"
        >
          <span className="size-2 animate-lamp-pulse bg-amber" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-console text-[0.72rem] font-bold uppercase tracking-console text-bone">
            Jacques AI
          </div>
          <div className="truncate font-console text-[0.52rem] uppercase tracking-console text-bone-faint">
            Analysis engine · all modules
          </div>
        </div>
        {onClose && (
          <Button type="button" variant="outline" size="icon-sm" onClick={onClose}>
            <span aria-hidden="true" className="text-sm leading-none">×</span>
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-2.5 p-2.5">
        {/* The transcript. Question slips are enamel; answers are printed on
            information-panel stock, because answers are the evidence. */}
        {/* A quiet recessed well, not moquette: this field is tall and holds
            running text, so the woven pattern belongs on the diagram band
            instead, where it is a decorative surface rather than a backdrop. */}
        <div
          ref={chatHistoryRef}
          className="rain-glass min-h-0 overflow-y-auto overscroll-contain rounded-unit border border-amber/15 bg-void-deep shadow-well"
        >
          <div className="space-y-2.5 p-2.5">
            {!chatHistory.some((entry) => entry.entity === "USER") && !streamState.started && (
              <div className="rounded-unit border border-amber/20 bg-panel-2 px-3 py-2.5">
                <div className="font-console text-[0.52rem] font-bold uppercase tracking-console-wide text-bone-faint">
                  Query interface
                </div>
                <p className="mt-2 font-read text-[0.84rem] leading-[1.7] text-bone/85">
                  Ask about experience, projects, or fit. Answers are retrieved from the
                  real repositories and credentials on this site, and the route to the
                  evidence is drawn on the module graph.
                </p>
              </div>
            )}
            {chatHistory.map((chatMessage, index) => (
              <AssistantMessage
                key={`${chatMessage.entity}-${index}`}
                chatMessage={chatMessage}
                onNavigate={onNavigate}
                onOpenProject={onOpenProject}
                onAchievement={onAchievement}
              />
            ))}
            {streamState.started && (
              <AssistantStreamingMessage streamState={streamState} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="relative flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loadingSuggestions || isThinking}
              onClick={loadSuggestions}
              aria-expanded={suggestionsMenuOpen}
            >
              <IconBulb />
              Suggestions
            </Button>
            <span className="font-console text-[0.55rem] tabular text-bone-faint">
              {message.length}/{MAX_CHAT_MESSAGE_LENGTH}
            </span>
            {suggestionsMenuOpen && (
              <div
                role="menu"
                aria-label="Suggested questions"
                className="absolute inset-x-0 bottom-full z-20 mb-2 max-w-full space-y-1.5 rounded-unit border border-amber/30 bg-panel-3 p-2.5 shadow-lift"
              >
                <div className="font-console text-[0.52rem] font-bold uppercase tracking-console-wide text-bone-soft">
                  Suggested questions
                </div>
                {loadingSuggestions ? (
                  <p className="font-console text-[0.62rem] uppercase tracking-console text-bone-faint">
                    Loading…
                  </p>
                ) : suggestions.length ? (
                  <div className="space-y-1.5">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        role="menuitem"
                        className="w-full min-w-0 break-words rounded-unit border border-amber/15 bg-panel-2 px-2.5 py-2 text-left font-read text-[0.8rem] leading-5 text-bone-soft transition-colors [overflow-wrap:anywhere] hover:border-amber hover:bg-panel-4 hover:text-bone"
                        onClick={() => deliverMessage(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="font-console text-[0.62rem] uppercase tracking-console text-bone-faint">
                    No suggestions available.
                  </p>
                )}
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              deliverMessage();
            }}
          >
            <Textarea
              aria-label="Message Jacques AI"
              data-assistant-input
              className="h-14 min-h-14 min-w-0 flex-1 resize-none py-3 text-[0.72rem]"
              placeholder="Ask about experience or projects…"
              maxLength={MAX_CHAT_MESSAGE_LENGTH}
              value={message}
              onChange={(event) => setMessage(clampChatMessage(event.target.value))}
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
              className="h-14 w-14 shrink-0"
              disabled={!message.trim() || isThinking}
            >
              <IconArrowUp className="size-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * The assistant's stages, on the board they always were. An SSE stream of
 * processing stages is structurally a departure board: rows that update in
 * place as real state changes, with a lamp per row.
 */
const AssistantStreamingMessage = ({ streamState }) => {
  const activeStageIndex = STREAM_STAGES.findIndex((stage) => stage.key === streamState.activeStage);
  const visibleStageIndex = activeStageIndex >= 0 ? activeStageIndex : 0;
  const activeStageLabel = STREAM_STAGES[visibleStageIndex]?.label || "Message received";
  const visibleStages = STREAM_STAGES.slice(0, visibleStageIndex + 1);

  return (
    <div className="space-y-2">
      {streamState.collapsed ? (
        <div
          data-stream-collapsed-stage
          className="crt flex items-center gap-2.5 rounded-unit border border-amber/20 px-2.5 py-1.5"
        >
          <span
            data-stream-stage-dot
            aria-hidden="true"
            className="h-2 w-2 shrink-0 animate-lamp-pulse bg-amber"
          />
          <span className="phosphor text-[0.6rem] uppercase tracking-console">
            {activeStageLabel}
          </span>
        </div>
      ) : (
        <BoardShell title="Working">
          <div role="status" aria-label={`Assistant stage: ${activeStageLabel}`}>
            {visibleStages.map((stage) => {
              const isActive = stage.key === streamState.activeStage;
              return (
                // Every visible stage keeps its own lamp, so the whole route
                // the request has travelled stays readable, not just the tip.
                <BoardRow
                  key={stage.key}
                  label={stage.label}
                  status={isActive ? "delayed" : "good"}
                  value={isActive ? "···" : "done"}
                  emphasis={isActive}
                  lampProps={{ "data-stream-stage-dot": "" }}
                />
              );
            })}
          </div>
        </BoardShell>
      )}
      {streamState.message && (
        <div className="animate-phosphor-in rounded-unit border border-amber/20 bg-panel-2 px-3 py-2.5 font-read text-[0.86rem] leading-[1.7] text-bone/90">
          <MessageMarkdown>{streamState.message}</MessageMarkdown>
        </div>
      )}
    </div>
  );
};

const AssistantMessage = ({ chatMessage, onNavigate, onOpenProject, onAchievement }) => {
  if (chatMessage.entity === "SYSTEM") {
    return (
      <div className="rounded-unit border border-blood/50 bg-blood/12 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 animate-lamp-pulse bg-blood"
          />
          <span className="font-console text-[0.5rem] font-bold uppercase tracking-console-wide text-blood">
            Signal fault
          </span>
        </div>
        <div className="break-words font-console text-[0.66rem] leading-5 text-blood/90 [overflow-wrap:anywhere]">
          <MessageMarkdown tone="inverse">{chatMessage.message}</MessageMarkdown>
        </div>
      </div>
    );
  }

  if (chatMessage.entity === "USER") {
    return (
      <div className="ml-auto max-w-[88%] rounded-unit border border-amber/30 bg-panel-3 px-3 py-2 font-console text-[0.74rem] leading-[1.6] text-bone">
        <MessageMarkdown tone="inverse">{chatMessage.message}</MessageMarkdown>
      </div>
    );
  }

  return (
    <div className="mr-auto max-w-[92%] animate-phosphor-in rounded-unit border border-amber/20 bg-panel-2 px-3 py-2.5 font-read text-[0.86rem] leading-[1.7] text-bone/90">
      <MessageMarkdown>{chatMessage.message}</MessageMarkdown>
      {chatMessage.links?.length > 0 && (
        <div className="mt-3 border-t border-amber/20 pt-2.5">
          <div className="mb-1.5 font-console text-[0.5rem] font-bold uppercase tracking-console-wide text-amber-dim">
            Route to evidence
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chatMessage.links.map((link, index) =>
              link.type === "project" ? (
                <Button
                  key={`${link.repoUrl}-${link.headingSlug}-${index}`}
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    onAchievement?.("follow-thread");
                    if (link.headingSlug) {
                      onAchievement?.("deep-link");
                    }
                    onOpenProject?.(link);
                  }}
                >
                  {link.text}
                </Button>
              ) : link.type === "internal" ? (
                <Button
                  key={`${link.where}-${link.experienceTab || link.certificationSlug || "section"}-${index}`}
                  type="button"
                  variant="secondary"
                  size="xs"
                  onClick={() => {
                    onAchievement?.("follow-thread");
                    onNavigate?.(link);
                  }}
                >
                  {link.text}
                </Button>
              ) : (
                <a
                  key={`${link.where}-${index}`}
                  href={link.where}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "secondary", size: "xs" }))}
                  onClick={() => {
                    onAchievement?.("follow-thread");
                    if (isGitHubUrl(link.where)) {
                      onAchievement?.("source-curious");
                    }
                  }}
                >
                  {link.text}
                  <IconExternalLink />
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantDock;
