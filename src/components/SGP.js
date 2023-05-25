import React, { useEffect, useState,onClick} from 'react'

const SGP = ({speed=10,preoccupy=true,quickLeave=true,toGenerate,className,onClick,style,onAnimationEnd,start=0}) => {
    const [text,setText]=useState((start<=toGenerate.length)?toGenerate.slice(0,start):"");
    useEffect(()=>{
        const timeout=setTimeout(()=>{if (text.length<toGenerate.length) setText(text.concat(toGenerate[text.length]))},speed);
        return ()=>clearTimeout(timeout)
    },[text])

  return (
    <div  >
    <p  className={className} onClick={onClick} style={style} onAnimationEnd={onAnimationEnd}>{text}</p>
    <p className={className+((preoccupy)?' invisible h-0':' hidden')} style={style}>{toGenerate}</p>
    </div>
  )
}

export default SGP