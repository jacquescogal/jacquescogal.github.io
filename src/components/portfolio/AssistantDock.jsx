import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconArrowUp,
  IconBulb,
  IconExternalLink,
  IconMessageChatbot,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addChatMessage,
  setAssistantPrompt,
  setShowChat,
  setTempDialogue,
  setThinking,
} from "../../store/chatbotStateSlice";
import { getChatSuggestions, sendChatMessage } from "../../api/chatApi";
import { linkTextParser } from "../../utils/Links";

const promptActions = [
  {
    title: "Role fit",
    prompt:
      "Summarize why Jacques Cogal fits this role using his recent software engineering, data, and LLM experience.",
  },
  {
    title: "Project proof",
    prompt:
      "Which projects best prove Jacques can build production-ready full-stack and AI features?",
  },
  {
    title: "Experience summary",
    prompt:
      "Give me a concise timeline of Jacques' work, internship, and education experience.",
  },
  {
    title: "Interview notes",
    prompt:
      "Create three interview talking points based on Jacques' portfolio and resume.",
  },
];

const AssistantDock = ({ onNavigate }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Jacques AI workspace"
        className="sticky top-20 hidden h-[calc(100vh-6rem)] min-h-[680px] xl:block"
      >
        <AssistantPanel onNavigate={onNavigate} />
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants(),
            "fixed bottom-5 right-5 z-[1200] gap-2 rounded-full shadow-lg xl:hidden"
          )}
          onClick={() => setSheetOpen(true)}
        >
          <IconMessageChatbot className="size-4" />
          Ask Jacques AI
        </SheetTrigger>
        <SheetContent className="w-full p-0 sm:max-w-md" side="right">
          <SheetHeader className="sr-only">
            <SheetTitle>Jacques AI workspace</SheetTitle>
            <SheetDescription>Chat with the portfolio assistant.</SheetDescription>
          </SheetHeader>
          <div
            role="complementary"
            aria-label="Jacques AI workspace"
            className="h-full p-3"
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
  const bottomRef = useRef(null);

  useEffect(() => {
    if (assistantPrompt) {
      setMessage(assistantPrompt);
      dispatch(setAssistantPrompt(""));
    }
  }, [assistantPrompt, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory, isThinking, suggestions, showSuggestions]);

  const seedPrompt = (prompt) => {
    dispatch(setAssistantPrompt(prompt));
    dispatch(setTempDialogue(prompt));
    dispatch(setShowChat(true));
  };

  const deliverMessage = async (nextMessage = message) => {
    const trimmed = nextMessage.trim();
    if (!trimmed || isThinking) return;

    dispatch(addChatMessage({ message: trimmed, entity: "USER", links: [] }));
    setMessage("");
    setSuggestions([]);
    setShowSuggestions(false);
    dispatch(setThinking(true));

    try {
      const response = await sendChatMessage(chatHistory, trimmed);
      dispatch(
        addChatMessage({
          entity: "AI",
          ...linkTextParser(response.ai_message),
        })
      );
    } catch (error) {
      dispatch(
        addChatMessage({
          entity: "SYSTEM",
          message: `error: ${error}`,
          links: [],
        })
      );
    } finally {
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
    <Card className="h-full gap-3 border-slate-200 bg-white/95 py-0 shadow-sm">
      <CardHeader className="gap-3 border-b px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2 gap-1 bg-emerald-50 text-emerald-700">
              <IconSparkles className="size-3" />
              Portfolio AI
            </Badge>
            <CardTitle className="text-base">Jacques AI workspace</CardTitle>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-slate-950 text-white">
            <IconMessageChatbot className="size-5" />
          </div>
        </div>
        <p className="text-sm leading-5 text-slate-600">
          Ask focused questions about Jacques' work, projects, and fit.
        </p>
      </CardHeader>

      <CardContent className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-3">
        <div className="grid grid-cols-2 gap-2">
          {promptActions.map((action) => (
            <Button
              key={action.title}
              type="button"
              variant="outline"
              className="h-auto justify-start whitespace-normal rounded-lg border-slate-200 bg-white p-3 text-left text-slate-900 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => seedPrompt(action.prompt)}
            >
              <span className="text-sm font-medium">{action.title}</span>
            </Button>
          ))}
        </div>

        <div className="min-h-0 rounded-xl border bg-slate-50">
          <ScrollArea className="h-full">
            <div className="space-y-3 p-3">
              {chatHistory.map((chatMessage, index) => (
                <AssistantMessage
                  key={`${chatMessage.entity}-${index}`}
                  chatMessage={chatMessage}
                  onNavigate={onNavigate}
                />
              ))}
              {isThinking && (
                <div className="w-fit rounded-xl border bg-white px-3 py-2 text-sm text-slate-600">
                  Thinking...
                </div>
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
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
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
              className="max-h-32 min-h-12 flex-1 resize-none bg-white"
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
            <Button type="submit" size="icon-lg" disabled={!message.trim() || isThinking}>
              <IconArrowUp className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

const AssistantMessage = ({ chatMessage, onNavigate }) => {
  if (chatMessage.entity === "SYSTEM") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        {chatMessage.message}
      </div>
    );
  }

  if (chatMessage.entity === "USER") {
    return (
      <div className="ml-auto max-w-[85%] rounded-xl bg-slate-950 px-3 py-2 text-sm text-white">
        {chatMessage.message}
      </div>
    );
  }

  return (
    <div className="mr-auto max-w-[88%] rounded-xl border bg-white px-3 py-2 text-sm leading-6 text-slate-700">
      <p>{chatMessage.message}</p>
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
              <Button key={`${link.where}-${index}`} asChild variant="outline" size="sm">
                <a href={link.where} target="_blank" rel="noreferrer">
                  {link.text}
                  <IconExternalLink className="size-3" />
                </a>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AssistantDock;
