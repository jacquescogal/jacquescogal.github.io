import React, { useState } from 'react'
import Intro from './Intro'
import Drawer from '../components/Drawer';
import Header from './Header';
import About from './About';
import Experience from './Experience';
import Project from './Project';
import Contact from './Contact';

const Homepage = () => {
  const [isOpen,setIsOpen]=useState(false);
  const [showMenu,setShowMenu]=useState(false);

  const [introRef,setIntroRef]=useState(null);
  const [aboutRef,setAboutRef]=useState(null);
  const [experienceRef,setExperienceRef]=useState(null);
  const [projectRef,setProjectRef]=useState(null);
  const [contactRef,setContactRef]=useState(null);
  const [setHeaderHighlight]=useState(null);
  return (
    <>
    
    <div className='fixed w-full h-full bg-slate-950 -z-50'/>
    
    <About setAboutRef={setAboutRef}/>
    
    <Header introRef={introRef} aboutRef={aboutRef} experienceRef={experienceRef} projectRef={projectRef} contactRef={contactRef}/>
    <Intro setIntroRef={setIntroRef}/>
    <Experience setExperienceRef={setExperienceRef}/>
    <Project setProjectRef={setProjectRef}/>
    <Contact setContactRef={setContactRef}/>
</>
  )
}

export default Homepage