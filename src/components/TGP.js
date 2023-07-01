import React, { useEffect, useState,onClick} from 'react'

const TGP = ({speed=10,preoccupy=true,quickLeave=true,initialText="",toGenerate,className,onClick,style,onAnimationEnd,randomChoice=5,loop=false}) => {
    const [text,setText]=useState(initialText);
    const [countDown,setCountdown]=useState(randomChoice);
    const [deleteLock,setDeleteLock]=useState(false);

    useEffect(()=>{
        if (quickLeave){
            setText(initialText);
            if (countDown==0) setCountdown(randomChoice);
            else if (countDown>0) setCountdown(0);
        }
        else{
            setDeleteLock(true)
        }
    },[toGenerate])

    useEffect(()=>{
        const timeout=setTimeout(()=>{
            if (deleteLock){
            if (text.length>0 && text.slice(0)===toGenerate.slice(0,text.length)){
                setDeleteLock(false)
                if (countDown==0) setCountdown(randomChoice);
                else if (countDown>0) setCountdown(0);
            }
            else if (text.length>0){
                setText(text.slice(0,-1));
            }
            else{
                setDeleteLock(false)
                if (countDown==0) setCountdown(randomChoice);
                else if (countDown>0) setCountdown(0);
            }
        }
        },speed);
        return ()=>clearTimeout(timeout);
    },[deleteLock,text])


    
    useEffect(()=>{
        const timeout=setTimeout(()=>{
            if (deleteLock==false && text!==toGenerate && text.length<=toGenerate.length) {
                if (text.length>0 && text.slice(0,-1)!==toGenerate.slice(0,text.length-1)) {
                    setText(toGenerate.slice(0,text.length));
                }
                if (countDown>0) {
                    if (countDown==randomChoice) setText(text.substring(0,text.length).concat(generateRandomChar()));
                    else setText(text.substring(0,text.length-1).concat(generateRandomChar()));
                    setCountdown(countDown-1);
                }
                else{
                    if (text.length>0) setText(text.substring(0,text.length-1).concat(toGenerate[text.length-1]))
                    else setText(toGenerate[0])
                    setCountdown(randomChoice);
                }
            }
            if (loop==true && text===toGenerate){
                setText(initialText)
                setCountdown(randomChoice-1)
            }
        },speed);
        return ()=>clearTimeout(timeout);
    },[countDown,deleteLock])

    const generateRandomChar=()=>{
        // 33 to 126 ascii
        const select=Math.floor(Math.random()*(126-33+1))+33;
        return String.fromCharCode(select);
    };

  return (
    <div  >
    <p  className={className} onClick={onClick} style={style} onAnimationEnd={onAnimationEnd}>{text}</p>
    <p className={className+((preoccupy)?' invisible h-0':' hidden')} style={style}>{toGenerate}</p>
    </div>
  )
}

export default TGP