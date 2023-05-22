import React, { useEffect, useRef } from 'react'

const Project = ({setProjectRef}) => {
    const projectRef=useRef(null);
    useEffect(()=>{
        setProjectRef(projectRef);
    },[projectRef])
  return (
    <>
    <div ref={projectRef}>Projects</div>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    <p className='text-6xl xl:text-9xl bold font-serif opacity-100'>Cogal Jacques Tracy Pasaol</p>
    </>
  )
}

export default Project