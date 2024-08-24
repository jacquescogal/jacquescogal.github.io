import React, { useState,useRef } from 'react'
import Intro from './Intro'
import Header from './Header';
import LogoLoad from './LogoLoad';
import Experience from './Experience';
import Project from './Project';
import Contact from './Contact';
import Chat from '../components/aichat/AIChat';
import resumePDF from '../resume_Jacques.pdf'
import Modal from '../components/modal/Modal';

const Homepage = (props) => {
  const [isOpen,setIsOpen]=useState(false);
  const [showMenu,setShowMenu]=useState(false);
  const [introRef,setIntroRef]=useState(null);
  const [aboutRef,setAboutRef]=useState(null);
  const [experienceRef,setExperienceRef]=useState(null);
  const [projectRef,setProjectRef]=useState(null);
  const [contactRef,setContactRef]=useState(null);
  const [setHeaderHighlight]=useState(null);
  const [logoLoaded,setLogoLoaded]=useState(false);
  const [headerLoaded,setHeaderLoaded]=useState(false);
  const [experienceReveal,setExperienceReveal]=useState(false);
  const [projectReveal,setProjectReveal]=useState(false);
  const [contactReveal,setContactReveal]=useState(false);

  const [profileFade,setProfileFade]=useState(false);
  const [experienceFade,setExperienceFade]=useState(false);
  const [projectFade,setProjectFade]=useState(false);
  const [contactFade,setContactFade]=useState(false);
  const lightMode=document.querySelector(".light-mode");
  const [light,setLight]=useState(false);

  const handleLight=()=>{
    lightMode.classList.toggle('light')
    setLight(!light)
  }

  const getResume = () => {
    // using Java Script method to get PDF file
    fetch(resumePDF).then(response => {
        response.blob().then(blob => {
            // Creating new object of PDF file
            const fileURL = window.URL.createObjectURL(blob);
            // Setting various property values
            let alink = document.createElement('a');
            alink.href = fileURL;
            alink.download ='Resume_CogalJacques.pdf';
            alink.click();
        })
    })
}

  const navBarRef = useRef(null);
  const smallBarRef = useRef(null);
  const stickerRef = useRef(null);
  const [closable, setClosable] = useState(true);
  const [forceNav, setForceNav] = useState(false);
  const [forceNavMin, setForceNavMin] = useState(0);

  // for scrolling on click
  const handleRefClick = (ref) => {
    const y = ref.current.offsetTop - Math.max(navBarRef.current?.clientHeight, smallBarRef.current?.clientHeight) - ((!closable) ? stickerRef.current?.clientHeight : 0);
    setForceNav(true);
    setForceNavMin(y);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // for scrolling on click
  const handleRefStrClick = (aStr) => {
    let ref=null;
    if (aStr === "resume") {
      getResume();
      ref = introRef;
    }
    else if (aStr === "profile") {
      ref = introRef;
    }
    else if (aStr === "experiences") {
      ref = experienceRef;
    }
    else if (aStr === "projects") {
      ref = projectRef;
    }
    else if (aStr === "contact") {
      ref = contactRef;
    }
    const y = ref.current.offsetTop - Math.max(navBarRef.current?.clientHeight, smallBarRef.current?.clientHeight) - ((!closable) ? stickerRef.current?.clientHeight : 0);
    setForceNav(true);
    setForceNavMin(y);
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="light-mode">
    
    {/* <button onClick={()=>{handleLight()}} className='fixed h-40 w-40 top-0 bg-white z-50'>HELLO</button> */}
    {(logoLoaded)?
    <>
    <div className='fixed w-full h-full background-parent -z-50'/>
    {/* <Modal/> */}
    <Header forceNav={forceNav} forceNavMin={forceNavMin} setForceNav={setForceNav} setForceNavMin={setForceNavMin}closable={closable} setClosable={setClosable} handleRefClick={handleRefClick} navBarRef={navBarRef} smallBarRef={smallBarRef} stickerRef={stickerRef} introRef={introRef} aboutRef={aboutRef} experienceRef={experienceRef} projectRef={projectRef} 
    contactRef={contactRef} setHeaderLoaded={setHeaderLoaded} setExperienceReveal={setExperienceReveal} 
    setProjectReveal={setProjectReveal} setContactReveal={setContactReveal} 
    setExperienceFade={setExperienceFade} setProfileFade={setProfileFade} setContactFade={setContactFade} setProjectFade={setProjectFade}
    light={light} handleLight={handleLight}
    />
    {(headerLoaded)?
    <>
    {/* <SideLinks/> */}
    <Chat isBootingUp={props.isBootingUp} writeLast={props.writeLast} setWriteLast={props.setWriteLast} handleRefStrClick={handleRefStrClick} isThinking={props.isThinking} handleSubmit={props.handleSubmit} prepareText={props.prepareText} chatHistory={props.chatHistory} setChatHistory={props.setChatHistory} chatContext={props.chatContext} setChatContext={props.setChatContext} chatBoxActive={props.chatBoxActive} setChatBoxActive={props.setChatBoxActive} chatInputText={props.chatInputText} setChatInputText={props.setChatInputText}/>
    <Intro setChatBoxActive={props.setChatBoxActive} contactRef={contactRef} setIntroRef={setIntroRef} setAboutRef={setAboutRef} profileFade={profileFade}/>
    <Experience setExperienceRef={setExperienceRef} experienceReveal={experienceReveal} experienceFade={experienceFade}/>
    <Project setProjectRef={setProjectRef} projectReveal={projectReveal} projectFade={projectFade}/>
    <Contact setContactRef={setContactRef} contactReveal={contactReveal} contactFade={contactFade}/></>:<></>}
    </>
    :
    <LogoLoad setLogoLoaded={setLogoLoaded}/>}
</div>
  )
}

export default Homepage