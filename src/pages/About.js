import React,{useEffect, useRef} from 'react'

const About = ({setAboutRef}) => {
    const aboutRef=useRef(null);
    useEffect(()=>{
        setAboutRef(aboutRef);
    },[aboutRef])

    

    
  return (
    <>
    <div ref={aboutRef} className='h-full w-full bg-white'>About</div>
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

export default About