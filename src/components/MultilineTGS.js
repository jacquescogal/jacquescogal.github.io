import React, { useEffect, useState } from 'react'
import TGS from './TGS';

const MultilineTGS = ({toGenerateMap,classNameMap}) => {
    const [generated,setGenerated]=useState([{toGenerate:toGenerateMap[0],className:classNameMap[0]}]);
    const [isAnimating,setIsAnimating]=useState(true);

    useEffect(()=>{
        if (!isAnimating && generated.length<toGenerateMap.length){
            setGenerated(generated.concat({toGenerate:toGenerateMap[generated.length],className:classNameMap[generated.length]}))
        } 
    },[isAnimating])
  return (
    <>
    {generated.map((object,index)=>
        <>
        <TGS key={index} toGenerate={object.toGenerate} className={object.className} 
        setIsAnimating={setIsAnimating}
        />
        </>
        )
    }
    </>
  )
}

export default MultilineTGS