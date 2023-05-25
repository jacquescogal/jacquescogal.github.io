import React, { useEffect, useRef } from 'react'

const Experience = ({setExperienceRef}) => {
    const experienceRef=useRef(null);
    useEffect(()=>{
        setExperienceRef(experienceRef);
    },[experienceRef])

    const skills={
      programming_languages:10,
      work:10
    }
  return (
    <>
    <div ref={experienceRef} className='text-slate-950 bg-slate-950 h-screen'>
    <div className='rounded-lg bg-teal-300 shadow-2xl shadow-teal-700 w-40 h-40'>
      test
    </div>
    
    </div>
    </>
  )
}

export default Experience