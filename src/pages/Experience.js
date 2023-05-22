import React, { useEffect, useRef } from 'react'

const Experience = ({setExperienceRef}) => {
    const experienceRef=useRef(null);
    useEffect(()=>{
        setExperienceRef(experienceRef);
    },[experienceRef])
  return (
    <>
    <div ref={experienceRef} data-te-animation-init
  data-te-animation-start="onScroll"
  data-te-animation="[slide-right_1s_ease-in-out]">Experiences</div>
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

export default Experience