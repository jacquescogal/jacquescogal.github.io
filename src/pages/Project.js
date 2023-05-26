import React, { useEffect, useRef } from 'react'

const Project = ({setProjectRef}) => {
    const projectRef=useRef(null);
    useEffect(()=>{
        setProjectRef(projectRef);
    },[projectRef])

  return (
    <>
    <div ref={projectRef}>Projects</div>

    </>
  )
}

export default Project