import { useEffect, useRef, useState } from "react";
import * as motion from "motion/react-client";
import { useDragControls } from "motion/react";
import ChatModal from "./ChatModal";
import { useDispatch, useSelector } from "react-redux";
import { setShowChat, setDialogue, setTempDialogue } from "../../store/chatbotStateSlice";

const thinkingDialogue = "Thinking...";
const doneDialogue = "Done!";
const talkSoonDialogue = "Talk to you soon!";

const ChatIcon = (props) => {
  const dispatch = useDispatch();
  const constraintsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const dialogue = useSelector((state) => state.chatbotState.dialogue);
  const isThinking = useSelector((state) => state.chatbotState.isThinking);
  const showChat = useSelector((state) => state.chatbotState.showChat);
  const controls = useDragControls();

  useEffect(()=>{
    if (showChat === true){
      if (isThinking===true){
        return
      }
      dispatch(setDialogue(""))
    }else{
      if (isThinking===true){
        dispatch(setDialogue(thinkingDialogue))
      } else if (dialogue===""){
        dispatch(setTempDialogue(talkSoonDialogue))
      }
    }
  },[showChat])

  useEffect(()=>{
    if (isThinking === false && dialogue===thinkingDialogue){
      dispatch(setDialogue(doneDialogue))
    }
  },[isThinking])
  return (
    <>
      <div ref={constraintsRef} className="fixed right-0 w-1/4 h-3/4 my-10 z-[20000] select-none pointer-events-none">
        <motion.div
          drag={!showChat}
          dragControls={controls}
          dragElastic={0.2}
          dragConstraints={showChat ? false : constraintsRef}
          className="absolute bottom-0 h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-900 rounded-full flex items-center justify-center z-10 cursor-pointer active:cursor-grabbing select-auto  pointer-events-auto"
          whileHover={{ scale: showChat ? 0 : 1.1 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          whileTap={{ scale: 0.9 }}
          onDrag={() => {
            setIsDragging(true);
          }}
          onDragEnd={() => setIsDragging(false)}
          onTap={() => {
            dispatch(setShowChat(!isDragging && !showChat));
          }}
          animate={{
            scale: showChat ? 0 : 1,
            background: isHovering
              ? "linear-gradient(135deg,rgb(49,46,129),rgb(59,130,246))"
              : "linear-gradient(135deg, rgb(59,130,246),rgb(49,46,129))",
          }}
          transition={{ duration: 0.3, ease: "easeIn" }}
        >
          <div className="pointer-events-none scale-110">
            <img src="/ai_mascot_only.png" />
          </div>
         {!isDragging && (
            <motion.div
            style={{transformOrigin:"bottom right"}}
              initial={{ opacity: 0, x: 0, scale:0 }}
              animate={{ opacity: 1, x: -5, scale: dialogue!=="" ? 1 : 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="absolute right-[4.2rem] bottom-[4.1rem] bg-white text-slate-900 px-4 py-2 rounded-xl rounded-br-none break-words w-[10rem] min-h-[3rem]"
            >
              {dialogue}
            </motion.div>
          )}
        </motion.div>
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-black opacity-50 -z-10 rounded-md border-1 border-slate-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: isDragging ? 0.5 : 0 }}
        />
      </div>

      <ChatModal showChat={showChat} {...props}/>
    </>
  );
};

export default ChatIcon;
