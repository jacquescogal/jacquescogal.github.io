import React, { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";
import { useDispatch, useSelector } from "react-redux";
import { setThinking, addChatMessage,setDialogue, setTempDialogue, setShowChat } from "../../store/chatbotStateSlice";
import { sendChatMessage } from "../../api/chatApi";
import { linkTextParser } from "../../utils/Links";
import { IoClose } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";

import style from './AIChat.module.scss'
import {BiLinkExternal} from 'react-icons/bi';
import { useAnimation } from "framer-motion";

const sendDialogue = "It's here!";

const ChatModal = ({ handleRefStrClick }) => {
  const dispatch = useDispatch();
  const showChat = useSelector((state) => state.chatbotState.showChat);
  return (
    <div className={"fixed h-full w-full flex items-center justify-center z-[1000] top-0 z-[20000] " + (showChat ? "" : " hidden")}>
      <motion.div
        className="relative h-3/4 md:w-1/2 w-3/4 flex flex-col bg-primary rounded-md shadow-lg overflow-hidden"
        animate={{ scale: showChat ? 1 : 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full h-12 bg-gradient-to-br to-blue-500 from-indigo-900 flex justify-between">
          <motion.div className="flex flex-row" animate={{ scale: showChat ? 1 : 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <img src="/ai_mascot_only.png" className="h-full scale-110 select-none" />
            <h1 className="text-white flex items-center">Jacques Bot</h1>
          </motion.div>
          <IoClose className="h-full scale-200 text-white mr-4 cursor-pointer hover:scale-220 hover:text-slate-200" onClick={() => dispatch(setShowChat(false))} />
        </div>
        <ChatBox  handleRefStrClick={handleRefStrClick}/>
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

const ChatBox = ({handleRefStrClick}) => {
  const [sendIsHovered, setSendIsHovered] = useState(false)
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.chatbotState.chatHistory);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const handleInput = async (e) => {
    if (e.key === "Enter" && !e.shiftKey && isThinking === true) {
      e.preventDefault();
      dispatch(addChatMessage({ entity: "SYSTEM", message: "Please wait for the AI to finish thinking", links: [] }));
      return
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      DeliverMessage();
    }
  };

  const DeliverMessage = () =>{
    if (message === "") {
      dispatch(addChatMessage({ entity: "SYSTEM", message: "Please enter a message", links: [] }));
      return;
    }
    dispatch(addChatMessage({ message: message, entity: "USER", links: [] }));
    const userMessage = message;
    setMessage("");
    dispatch(setThinking(true));
    sendChatMessage(chatHistory, userMessage)
      .then((response) => {
        dispatch(addChatMessage({ entity: "AI", ...linkTextParser(response.ai_message) }));
      })
      .catch((error) => {console.log("error");dispatch(addChatMessage({ entity: "SYSTEM", message: `error: ${error}`, links: [] }))})
      .finally(() => dispatch(setThinking(false)));
  }

  useEffect(() => {
    if (bottomRef.current) {
      const chatContainer = bottomRef.current?.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [chatHistory]);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-white">
      <div className="relative w-full h-full flex flex-col overflow-y-scroll p-1">
        {chatHistory.map((chatMessage, index) => (
          <ChatMessage key={index} entity={chatMessage.entity} message={chatMessage.message} links={chatMessage.links} handleRefStrClick={handleRefStrClick}/>
        ))}
        {isThinking && <ChatMessage entity="THINK" />}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative color-content h-32 w-full  rounded-b-md border-t-2 border-slate-600 flex">
        <textarea className=" w-full bg-inherit h-full inset-shadow-sm
        shadow" onKeyDown={handleInput} style={{ resize: "none" }} 
        value={message} onChange={(e) => setMessage(e.target.value)}
        />
        {isThinking && <div className="absolute h-full w-full bg-slate-500 z-10 opacity-80"/>}
        <div className="relative flex flex-col justify-center items-center">
        <motion.div className="right-2 bg-blue-700 h-12 w-12 rounded-full  flex items-center justify-center cursor-pointer overflow-hidden align-middle justify-middle align-center mx-2"
        onHoverStart={()=>{
          setSendIsHovered(true)
        }}
        onHoverEnd={()=>{
          setSendIsHovered(false)
        }}
        onTap={DeliverMessage}
        
        >
        <motion.div 
        animate={
          sendIsHovered ? {x: "200%", y: "-200%"} : {x: "0%", y: "0%"}
        }
        transition={{ duration: 1, repeat: sendIsHovered ? Infinity : 0 , repeatType: "mirror", ease: "easeOut"}}
        >
        <IoIosSend className="text-white text-2xl" />
        </motion.div>
        
        </motion.div>
        </div>
        
        </div>
      </form>
    </div>
  );
};
export default ChatModal;


const ChatMessage= (prop) => {
  const dispatch = useDispatch();
  
  return (
    <>
    {prop.entity === "SYSTEM" && <div className={style.SystemMessage}>
        <div className={style.ChatLine} />
        {prop.message}
        <div className={style.ChatLine} />
      </div>}
      {prop.entity === "AI" && <div className={style.BotBubble}>{prop.message}
      <br/>
      {
        prop.links.map((link)=>(
          <>
          {link.type==="internal" &&<a onClick={()=>{prop.handleRefStrClick(link.where); dispatch(setTempDialogue(sendDialogue)); dispatch(setShowChat(false))}} className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          {link.type==="external" &&<a href={link.where} target='_blank' className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          </>
        ))
      }
      </div>}
      {prop.entity === "USER" && <div className={style.UserBubble}>{prop.message}
      </div>}
      {prop.entity === "THINK" && <div className={style.ThinkBubble}>{
        <div className={style.ThinkBubbleContent}>
          <div className={style.ThinkBubbleDot} />
          <div className={style.ThinkBubbleDot} />
          <div className={style.ThinkBubbleDot} />
          </div>
      }</div>}
    </>
  )
}
