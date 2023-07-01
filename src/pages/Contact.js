import React, { useEffect, useRef,useState } from 'react'
import TGS from '../components/TGS';
import '../contact.css'
import MultilineTGS from '../components/MultilineTGS';

const Contact = ({setContactRef,contactReveal,contactFade}) => {
  const [name,setName]=useState("");
  const [subject,setSubject]=useState("");
  const [message,setMessage]=useState("");
  // const [email]
    const contactRef=useRef(null);
    useEffect(()=>{
        setContactRef(contactRef);
    },[contactRef])

    const blockSelect = document.querySelector('.section-block.contact-block');

    useEffect(()=>{
      if (contactReveal){
        blockSelect?.classList.remove('hide')
        blockSelect?.classList.add('show')
      }
    },[contactReveal])

    useEffect(() => {
      if (contactFade) {
        blockSelect?.classList.add('fade')
      }
      else{
        blockSelect?.classList.remove('fade')
      }
    }, [contactFade])
  return (
    <>
    <div ref={contactRef} className='flex flex-col section-block contact-block hide'>
    <p className='title-comp flex-none px-8 pt-4 text-left'>
    <span className='section-text text-4xl'>4.</span>
    <MultilineTGS toGenerateMap={["Contact Me"," (I'll appreciate it!)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    <div className='form'>
    <form action="https://formsubmit.co/a1e93437966df7514f8b43e5b06685c5" method="POST">
    {/* <form onSubmit={(e)=>{console.log(e.currentTarget)}}> */}
    <label htmlFor="email">E-mail:</label>
     <input className='textbox-color' onChange={(e)=>{setName(e.currentTarget.value)}} type="email" name="email" placeholder='yourEmail@.mail.com' required/>
    <label htmlFor="name">Name:</label>
     <input className='textbox-color' onChange={(e)=>{setName(e.currentTarget.value)}} type="text" name="name" placeholder='Sam' required/>
     <label  htmlFor="text">Subject:</label>
     <input className='textbox-color' onChange={(e)=>{setSubject(e.currentTarget.value)}} type="text" name="subject" placeholder='Extended warranty' required/>
     <label htmlFor="message">Message:</label>
     <textarea onChange={(e)=>{setMessage(e.currentTarget.value)}} id="message" name="message" rows="4" cols="50" placeholder="Hello, I'd like to talk to you about your car's extended warranty...">
</textarea>
<button type="submit" className='contact-submit-button'>Send Through API</button>
     </form>
     <button type="submit" className='contact-submit-button' onClick={()=>{window.open('mailto:jacques002@e.ntu.edu.sg?subject='+encodeURIComponent(subject)+'&body=Hi%20Jacques%2C%0A%0A'+encodeURIComponent(message)+'%0A%0ARegards%2C%0A'+encodeURIComponent(name))}}>Send Direct E-mail</button>
     </div>
     </div>
    </>
  )
}

export default Contact