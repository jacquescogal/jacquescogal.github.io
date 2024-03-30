import React, { useEffect, useState } from 'react'
import style from './AIChat.module.scss'
import { DialogueBubbleType } from './DialogueBubble'
import { IoSendSharp } from 'react-icons/io5'
import { IconContext } from 'react-icons'
import axios from 'axios'
import AiLogo from '../ailogo/AiLogo'
import AIChatBox from './AIChatBox'

function processText(chatInputText) {
  const [command, ...messageArray] = chatInputText.split(' ');
  const message = messageArray.join(' ');
  return { command, message };
}

const AIChat = (props) => {
  const defaultDialogue="Hey there, click on me. I'd like to chat with you!";
  const dialogueRef = React.useRef(null);
  const [showDialogue,setShowDialogue] = useState(true);
  const [dialogue,setDialogue]=useState('');
  const [showSendButton, setShowSendButton] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const updateDialogue=(message)=>{
      dialogueRef.current?.classList.add(style.TopBubbleGone);
      
      setTimeout(()=>{
        setDialogue(message)
        dialogueRef.current?.classList.remove(style.TopBubbleGone);
      },500)
  }

  useEffect(()=>{
    if (props.isBootingUp===true){
      updateDialogue("Waking up Chatbot...")
    }
    else if (props.isBootingUp===false){
      updateDialogue("Chatbot online!")
      setHasLoaded(true);
      setTimeout(()=>{
        updateDialogue(defaultDialogue)
      },2000)
    }
  },[props.isBootingUp])

  useEffect(()=>{
    if (props.isThinking===true){
      updateDialogue("Thinking...")
    }
    else if (props.isThinking===false && dialogue==="Thinking..."){
      if (props.chatBoxActive===true){
        updateDialogue("")
      }
      else{
        updateDialogue("Done!")
      }
    }
  },[props.isThinking])
    
  useEffect(()=>{
    if (props.chatBoxActive===false){
      props.setChatInputText("");
      setShowSendButton(false);
      if (hasLoaded===true && props.isThinking===false && dialogue!==defaultDialogue){
        updateDialogue("Talk to you soon!")
        setTimeout(()=>{
          updateDialogue("")
        },2000)
    }
    }
    setShowSendButton(false);
  },[props.chatBoxActive])


  return (
    <div className={style.ChatHolder}>
      {dialogue!=="" && <div ref={dialogueRef} className={style.TopBubble} onClick={() => {setDialogue("");props.isBootingUp===false?props.setChatBoxActive(true):props.setChatBoxActive(false)}}>{dialogue}</div>}
      <form onSubmit={(e)=>{e.preventDefault();props.handleSubmit()}}className={style.CardAnsForm}>
      {props.chatBoxActive === false && <div className={style.ChatButton} onClick={() => {props.isBootingUp===false?props.setChatBoxActive(true):props.setChatBoxActive(false)}}>
        <div className={style.RelativeGroup}>
      <IconContext.Provider value={{ className: style.IoSendSharpClose }}>
          <IoSendSharp size={30} />
        </IconContext.Provider>
      {showSendButton===false && 
      <>
      {(props.isThinking===true || props.isBootingUp) && <div className={style.ThinkBubbleContentButton}>
        <div className={style.ThinkBubbleDot} />
        <div className={style.ThinkBubbleDot} />
        <div className={style.ThinkBubbleDot} />
        </div>}
      <AiLogo prepareText={props.prepareText} className={style.AiAppearLogo} onAnimationEnd={()=>{setShowSendButton(false)}} backgroundColor={"secondary"}/>
      </>
      }
      </div>
      </div>}

      {props.chatBoxActive === true && <div className={style.SendButton} onClick={() => {props.handleSubmit()}}>
      <div className={style.RelativeGroup}>
      
      {showSendButton===true && <IconContext.Provider value={{ className: style.IoSendSharp }}>
          <IoSendSharp size={30} />
        </IconContext.Provider>
        }
        <AiLogo prepareText={props.prepareText} className={style.AiGoneLogo} onAnimationEnd={()=>{setDialogue("");setShowSendButton(true)}} backgroundColor={"secondary"}/>
        </div>
      </div>}
      <AIChatBox writeLast={props.writeLast} setWriteLast={props.setWriteLast} handleRefStrClick={props.handleRefStrClick} isThinking={props.isThinking} prepareText={props.prepareText} chatContext={props.chatContext} setChatContext={props.setChatContext} setChatBoxActive={props.setChatBoxActive} isActive={props.chatBoxActive} chatHistory={props.chatHistory} chatInputText={props.chatInputText} setChatInputText={props.setChatInputText} handleSubmit={props.handleSubmit} messageLength={props.chatHistory.length}/>
      </form>
    </div>
  )
}

export default AIChat