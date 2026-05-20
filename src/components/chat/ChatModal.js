import React, { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";
import { useDispatch, useSelector } from "react-redux";
import {
  setThinking,
  addChatMessage,
  setTempDialogue,
  setShowChat,
  setAssistantPrompt,
} from "../../store/chatbotStateSlice";
import { sendChatMessage, getChatSuggestions } from "../../api/chatApi";
import { linkTextParser } from "../../utils/Links";
import { IoClose } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { HiLightBulb } from "react-icons/hi";

import style from "./AIChat.module.scss";
import { BiLinkExternal } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const sendDialogue = "It's here!";
const thinkingDialogue = "Thinking...";
const doneDialogue = "Done!";
const talkSoonDialogue = "Talk to you soon!";

const ChatModal = ({ handleRefStrClick }) => {
  const dispatch = useDispatch();
  const showChat = useSelector((state) => state.chatbotState.showChat);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const [animState, setAnimState] = useState(0);
  useEffect(() => {
    if (isThinking === false) {
      if (animState === 1) {
        setAnimState(2);
        setTimeout(() => {
          setAnimState(0);
        }, 1000);
      } else {
        setAnimState(0);
      }
    } else {
      setAnimState(1);
    }
  }, [isThinking]);
  return (
    <div
      className={
        "fixed h-full w-full flex items-center justify-center z-[1000] top-0 z-[20000] " +
        (showChat ? "" : " hidden")
      }
    >
      <motion.div
        className="relative h-3/4 md:w-1/2 w-3/4 flex flex-col bg-primary rounded-md shadow-lg overflow-hidden"
        animate={{ scale: showChat ? 1 : 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-12 bg-gradient-to-br to-blue-500 from-indigo-900 flex justify-between">
          <motion.div
            className="flex flex-row"
            animate={{ scale: showChat ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className=" bg-blue-100 w-10 h-10 rounded-full overflow-hidden mx-2 my-1 ">
              <div className="pointer-events-none translate-y-1">
                {animState === 1 ? (
                  <img src="/ai_mascot_think.png" />
                ) : animState === 2 ? (
                  <img src="/ai_mascot_answer.png" />
                ) : (
                  <img src="/ai_mascot_only.png" />
                )}
              </div>
            </div>
            <h1 className="text-white flex items-center">Jacques AI</h1>
          </motion.div>
          <IoClose
            className="h-full scale-200 text-white mr-4 cursor-pointer hover:scale-220 hover:text-slate-200"
            onClick={() => dispatch(setShowChat(false))}
          />
        </div>
        <ChatBox handleRefStrClick={handleRefStrClick} />
      </motion.div>
      <motion.div
        className="absolute top-0 left-0 h-full w-full bg-black -z-10"
        animate={{ opacity: showChat ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => dispatch(setShowChat(false))}
      />
    </div>
  );
};

const ChatBox = ({ handleRefStrClick }) => {
  const [sendIsHovered, setSendIsHovered] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const bottomRef = useRef(null);
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.chatbotState.chatHistory);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const assistantPrompt = useSelector((state) => state.chatbotState.assistantPrompt);
  const handleInput = async (e) => {
    if (e.key === "Enter" && !e.shiftKey && isThinking === true) {
      e.preventDefault();
      dispatch(
        addChatMessage({
          entity: "SYSTEM",
          message: "Please wait for the AI to finish thinking",
          links: [],
        })
      );
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      DeliverMessage();
    }
  };

  const loadSuggestions = async () => {
    if (chatHistory.length > 0) {
      setLoadingSuggestions(true);
      try {
        const newSuggestions = await getChatSuggestions(chatHistory);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const toggleSuggestions = async () => {
    if (showSuggestions) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
      if (suggestions.length === 0) {
        await loadSuggestions();
      }
    }
  };

  const DeliverMessage = () => {
    if (message === "") {
      dispatch(
        addChatMessage({
          entity: "SYSTEM",
          message: "Please enter a message",
          links: [],
        })
      );
      return;
    }
    dispatch(addChatMessage({ message: message, entity: "USER", links: [] }));
    const userMessage = message;
    setMessage("");
    setShowSuggestions(false);
    setSuggestions([]);
    dispatch(setThinking(true));
    sendChatMessage(chatHistory, userMessage)
      .then((response) => {
        dispatch(
          addChatMessage({
            entity: "AI",
            ...linkTextParser(response.ai_message),
          })
        );
      })
      .catch((error) => {
        dispatch(
          addChatMessage({
            entity: "SYSTEM",
            message: `error: ${error}`,
            links: [],
          })
        );
      })
      .finally(() => {
        dispatch(setThinking(false));
      });
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    dispatch(addChatMessage({ message: suggestion, entity: "USER", links: [] }));
    dispatch(setThinking(true));
    sendChatMessage(chatHistory, suggestion)
      .then((response) => {
        dispatch(
          addChatMessage({
            entity: "AI",
            ...linkTextParser(response.ai_message),
          })
        );
      })
      .catch((error) => {
        dispatch(
          addChatMessage({
            entity: "SYSTEM",
            message: `error: ${error}`,
            links: [],
          })
        );
      })
      .finally(() => {
        dispatch(setThinking(false));
      });
    setMessage("");
  };

  useEffect(() => {
    if (bottomRef.current) {
      const chatContainer = bottomRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, showSuggestions, suggestions]);

  useEffect(() => {
    if (assistantPrompt) {
      setMessage(assistantPrompt);
      dispatch(setAssistantPrompt(""));
    }
  }, [assistantPrompt, dispatch]);


  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-white">
      <div className="relative w-full h-full flex flex-col overflow-y-scroll p-1">
        {chatHistory.map((chatMessage, index) => (
          <ChatMessage
            key={index}
            entity={chatMessage.entity}
            message={chatMessage.message}
            links={chatMessage.links}
            handleRefStrClick={handleRefStrClick}
          />
        ))}
        {isThinking && <ChatMessage entity="THINK" />}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-4 p-3 bg-neutral-300 rounded-lg border">
            <p className="text-sm text-slate-800 mb-2 font-medium">Suggested questions:</p>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="h-auto justify-start whitespace-normal rounded-md bg-white p-2 text-left text-sm"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      {chatHistory.length > 0 && !isThinking && (
        <div className="px-3 py-2 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={toggleSuggestions}
            disabled={loadingSuggestions}
            className="text-blue-800"
          >
            <HiLightBulb className="text-lg" />
            {loadingSuggestions ? (
              "Loading suggestions..."
            ) : showSuggestions ? (
              "Hide suggestions"
            ) : (
              "Get suggestions"
            )}
          </Button>
        </div>
      )}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative color-content h-32 w-full  rounded-b-md border-t-2 border-slate-600 flex">
          <Textarea
            className="h-full min-h-0 w-full rounded-none border-0 bg-inherit shadow-none focus-visible:ring-0"
            onKeyDown={handleInput}
            style={{ resize: "none" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {isThinking && (
            <div className="absolute h-full w-full bg-slate-500 z-10 opacity-80" />
          )}
          <div className="relative flex flex-col justify-center items-center">
            <Button
              type="button"
              size="icon-lg"
              className="right-2 mx-2 h-12 w-12 overflow-hidden rounded-full bg-blue-700 hover:bg-blue-800"
              onMouseEnter={() => {
                setSendIsHovered(true);
              }}
              onMouseLeave={() => {
                setSendIsHovered(false);
              }}
              onClick={DeliverMessage}
            >
              <motion.div
                animate={
                  sendIsHovered
                    ? { x: "200%", y: "-200%" }
                    : { x: "0%", y: "0%" }
                }
                transition={{
                  duration: 1,
                  repeat: sendIsHovered ? Infinity : 0,
                  repeatType: "mirror",
                  ease: "easeOut",
                }}
              >
                <IoIosSend className="text-white text-2xl" />
              </motion.div>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ChatModal;

const ChatMessage = (prop) => {
  const dispatch = useDispatch();

  return (
    <>
      {prop.entity === "SYSTEM" && (
        <div className={style.SystemMessage}>
          <div className={style.ChatLine} />
          {prop.message}
          <div className={style.ChatLine} />
        </div>
      )}
      {prop.entity === "AI" && (
        <div className={style.BotBubble}>
          {prop.message}
          <br />
          {prop.links.map((link, index) => (
            <React.Fragment key={`${link.type}-${link.where}-${index}`}>
              {link.type === "internal" && (
                <a
                  onClick={() => {
                    prop.handleRefStrClick(link.where);
                    dispatch(setTempDialogue(sendDialogue));
                    dispatch(setShowChat(false));
                  }}
                  className={style.BubbleLink}
                  role="button"
                  tabIndex={0}
                >
                  <span className={style.BubbleAlign}>
                    {link.text}
                    <BiLinkExternal size={15} />
                  </span>
                </a>
              )}
              {link.type === "external" && (
                <a
                  href={link.where}
                  target="_blank"
                  rel="noreferrer"
                  className={style.BubbleLink}
                >
                  <span className={style.BubbleAlign}>
                    {link.text}
                    <BiLinkExternal size={15} />
                  </span>
                </a>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
      {prop.entity === "USER" && (
        <div className={style.UserBubble}>{prop.message}</div>
      )}
      {prop.entity === "THINK" && (
        <div className={style.ThinkBubble}>
          {
            <div className={style.ThinkBubbleContent}>
              <div className={style.ThinkBubbleDot} />
              <div className={style.ThinkBubbleDot} />
              <div className={style.ThinkBubbleDot} />
            </div>
          }
        </div>
      )}
    </>
  );
};
