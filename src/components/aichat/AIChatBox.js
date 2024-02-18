import React, { useEffect, useState } from 'react'
import style from './AIChat.module.scss'
import { ImAttachment } from 'react-icons/im'
import { IconContext } from 'react-icons'
import { BiSolidDownArrow } from 'react-icons/bi'
import { FaExpandArrowsAlt } from 'react-icons/fa'
import {ImShrink} from 'react-icons/im'
import AiLogo from '../ailogo/AiLogo'
import DialogueBubble,{DialogueBubbleType } from './DialogueBubble'
import { toast } from 'react-toastify'



const AIChatBox= (props) => {
    const chatBoxRef = React.useRef(null);
    const bottomRef = React.useRef(null);
    const inputRef = React.useRef(null);
    const [chatExpand,setChatExpand]=useState(false);
    const [consent,setConsent]=useState(false);
    const handleInputTextChange = (e) => {
        if (consent===false){
            return;
        }
        props.setChatInputText(e.target.value);
    }
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            props.handleSubmit();
        }
    };

    const handleExpand = () => {
        setChatExpand(true);
        chatBoxRef.current?.classList.add(style.Expand);
        chatBoxRef.current?.classList.remove(style.Shrink);
    }
    const handleShrink = () => {
        setChatExpand(false);
        chatBoxRef.current?.classList.remove(style.Expand);
        chatBoxRef.current?.classList.add(style.Shrink);
    }

    const handleClose = () => {
        chatBoxRef.current?.classList.add(style.ChatBoxFlyDown);
        chatBoxRef.current?.classList.remove(style.ChatBoxFlyUp);
        setTimeout(() => {
            props.setWriteLast(false);
            props.setChatBoxActive(false);
        }, 500);
    }

    useEffect(()=>{
        if (props.isActive===true){
            inputRef.current?.focus();
            handleShrink();
        }
    },[props.isActive,consent])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" })
    }, [props.isActive])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    },[props.messageLength,props.writeLast])

    useEffect(()=>{
        if (props.isThinking===true){
            inputRef.current?.classList.add(style.ChatInputInactive);
            console.log("thinking")
        }
        else if (props.isThinking===false){
            inputRef.current?.classList.remove(style.ChatInputInactive);
            console.log("not thinking")
        }
    },[props.isThinking])

    return (
        <>
            
            {props.isActive === true && <div ref={chatBoxRef} className={`${style.ChatBox} ${style.ChatBoxFlyUp}`}>
                <div className={style.ChatHeader}>

                    <div className={style.HeaderText}>
                        <AiLogo prepareText={props.prepareText}className={style.AiLogo} backgroundColor={"primary"} />
                        <h2>Jacques (AI)</h2>
                    </div>
                    {(chatExpand===true) && <div className={style.CloseButton} onClick={() => { handleShrink() }}>
                        <IconContext.Provider value={{ className: style.ShrinkIcon }}>
                            <ImShrink size={30} />
                        </IconContext.Provider>
                    </div>}
                    {(chatExpand===false) && <div className={style.CloseButton} onClick={() => { handleExpand() }}>
                        <IconContext.Provider value={{ className: style.ExpandIcon }}>
                            <FaExpandArrowsAlt size={30} />
                        </IconContext.Provider>
                    </div>}
                    
                    <div className={style.CloseButton} onClick={() => { handleClose() }}>
                        <IconContext.Provider value={{ className: style.BiSolidDownArrow }}>
                            <BiSolidDownArrow size={30} />
                        </IconContext.Provider>
                    </div>
                </div>
                <div className={style.ChatHistory}>
                    {props.chatHistory.map((bubble,index) => (
                        <>
                        {(bubble.type==="ai" && index===props.chatHistory.length-1 && props.writeLast===true)?<DialogueBubble setWriteLast={props.setWriteLast} type={"last_ai"} message={bubble.message} links={bubble.links} handleRefStrClick={props.handleRefStrClick} />:
                        <DialogueBubble type={bubble.type} message={bubble.message} links={bubble.links} handleRefStrClick={props.handleRefStrClick} />}
                        </>
                    ))}
                    {props.isThinking===true && <DialogueBubble type={"think"} />}
                    <div ref={bottomRef} />
                    
                </div>
                <div className={style.ChatContext}>{""}
                </div>
                {consent===false && <div className={style.DataBackdrop}>
                    <div className={style.Notice}>
                        <h1 className={style.NoticeHeader}>Chatbot Terms & Conditions</h1>
                        <p className={style.NoticeText}>
                            Anonimized chat history is collected for the purpose of improving the chatbot. 
                            Please do not provide personal data. You agree to be responsible for the content of your messages.
                        </p>
                        <button className={style.NoticeButton} onClick={()=>{setConsent(true)}} >Consent & Agree</button>
                    </div>
                </div>}

                <textarea ref={inputRef} onKeyDown={handleKeyDown} className={`${style.ChatInput} `} onChange={handleInputTextChange} value={props.chatInputText}>
                
                </textarea>
            </div>}
        </>
    )
}

export default AIChatBox