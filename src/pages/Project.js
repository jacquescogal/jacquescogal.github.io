import React, { useEffect, useRef } from 'react'
import MultilineTGS from '../components/MultilineTGS';

const Project = ({setProjectRef}) => {
    const projectRef=useRef(null);
    useEffect(()=>{
        setProjectRef(projectRef);
    },[projectRef])

  return (
    <>
    <div ref={projectRef}></div>
    <p className='flex-none px-8 pt-4 text-left title-comp intro-load'>
    <span className='text-green-300 text-4xl' >3.</span>
    <MultilineTGS toGenerateMap={["Projects"," (Under construction. Will be done soon!)"]} classNameMap={["number-text","flair-text"]}/>
    </p>

    </>
  )
}

export default Project