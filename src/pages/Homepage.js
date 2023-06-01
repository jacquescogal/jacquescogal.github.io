import React, { useState,useRef } from 'react'
import Intro from './Intro'
import Drawer from '../components/Drawer';
import Header from './Header';
import LogoLoad from './LogoLoad';
import Experience from './Experience';
import Project from './Project';
import Contact from './Contact';
import Test from './Test';

const Homepage = () => {
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

  return (
    <>
    
    <div className='fixed w-full h-full bg-slate-950 -z-50'/>
    {(logoLoaded)?
    <>
    <Header introRef={introRef} aboutRef={aboutRef} experienceRef={experienceRef} projectRef={projectRef} contactRef={contactRef} setHeaderLoaded={setHeaderLoaded} />
    {(headerLoaded)?
    <><Intro setIntroRef={setIntroRef} setAboutRef={setAboutRef}/>
    <Experience setExperienceRef={setExperienceRef}/>
    <Project setProjectRef={setProjectRef}/>
    <Contact setContactRef={setContactRef}/></>:<></>}
    </>
    :
    <LogoLoad setLogoLoaded={setLogoLoaded}/>}
</>
  )
}

export default Homepage