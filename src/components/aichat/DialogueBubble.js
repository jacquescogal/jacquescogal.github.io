import React, { useEffect } from 'react'
import style from './AIChat.module.scss'
import {BiLinkExternal} from 'react-icons/bi';
import TGS from '../TGS';

const DialogueBubble= (prop) => {
  
  return (
    <>
      {prop.type === "system" && <div className={style.SystemMessage}>
        <div className={style.ChatLine} />
        {prop.message}
        <div className={style.ChatLine} />
      </div>}
      {prop.type === "ai" && <div className={style.BotBubble}>{prop.message}
      <br/>
      {
        prop.links.map((link)=>(
          <>
          {link.type==="internal" &&<a onClick={()=>{prop.handleRefStrClick(link.where)}} className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          {link.type==="external" &&<a href={link.where} target='_blank' className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          </>
        ))
      }
      </div>}
      {prop.type === "last_ai" && <div className={style.BotBubbleLast}>{prop.message}
      <br/>
      {
        prop.links.map((link)=>(
          <>
          {link.type==="internal" &&<a onClick={()=>{prop.handleRefStrClick(link.where)}} className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          {link.type==="external" &&<a href={link.where} target='_blank' className={style.BubbleLink}><span  className={style.BubbleAlign}>{link.text}<BiLinkExternal size={15}/></span></a>}
          </>
        ))
      }
      </div>}
      {prop.type === "user" && <div className={style.UserBubble}>{prop.message}
      </div>}
      {prop.type === "think" && <div className={style.ThinkBubble}>{
        <div className={style.ThinkBubbleContent}>
          <div className={style.ThinkBubbleDot} />
          <div className={style.ThinkBubbleDot} />
          <div className={style.ThinkBubbleDot} />
          </div>
      }</div>}
    </>
  )
}

export default DialogueBubble