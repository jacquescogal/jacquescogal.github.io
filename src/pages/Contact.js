import React, { useEffect, useRef } from 'react'

const Contact = ({setContactRef}) => {
    const contactRef=useRef(null);
    useEffect(()=>{
        setContactRef(contactRef);
    },[contactRef])
  return (
    <>
    <div ref={contactRef}>Contact</div>
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

export default Contact