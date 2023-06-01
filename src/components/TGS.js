import React, { useEffect, useState,onClick} from 'react'

const TGS = ({speed=10,toGenerate,className,onClick,setIsAnimating=(()=>{})}) => {
    const [text,setText]=useState("");
    const [countDown,setCountdown]=useState(5);

    useEffect(()=>{
        setText("");
        setIsAnimating(true);
        if (countDown==0) setCountdown(5);
        else if (countDown>0) setCountdown(0);
    },[toGenerate])


    
    useEffect(()=>{
        const timeout=setTimeout(()=>{
            if (text!==toGenerate && text.length<=toGenerate.length) {
                if (text.length>0 && text.slice(0,-1)!==toGenerate.slice(0,text.length-1)) {
                    setText(toGenerate.slice(0,text.length));
                }
                if (countDown>0) {
                    if (countDown==5) setText(text.substring(0,text.length).concat(generateRandomChar()));
                    else setText(text.substring(0,text.length-1).concat(generateRandomChar()));
                    setCountdown(countDown-1);
                }
                else{
                    if (text.length>0) setText(text.substring(0,text.length-1).concat(toGenerate[text.length-1]))
                    else setText(toGenerate[0])
                    setCountdown(5);
                }
            }
            else{
                setIsAnimating(false)
            }
        },speed);
        return ()=>clearTimeout(timeout);
    },[countDown])


    const generateRandomChar=()=>{
        // 33 to 126 ascii
        const select=Math.floor(Math.random()*(126-33+1))+33;
        return String.fromCharCode(select);
    };

  return (
    <span className={className} onClick={onClick}>{text}</span>
  )
}

export default TGS