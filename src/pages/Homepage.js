import React, { useState,useRef } from 'react'
import Intro from './Intro'
import Drawer from '../components/Drawer';
import Header from './Header';
import LogoLoad from './LogoLoad';
import Experience from './Experience';
import Project from './Project';
import Contact from './Contact';
import Test from './Test';
import SideLinks from './SideLinks';

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
  return (
    <div className="light-mode">
    
    {/* <button onClick={()=>{handleLight()}} className='fixed h-40 w-40 top-0 bg-white z-50'>HELLO</button> */}
    {(logoLoaded)?
    <>
    <div className='fixed w-full h-full background-parent -z-50'/>
    <Header introRef={introRef} aboutRef={aboutRef} experienceRef={experienceRef} projectRef={projectRef} 
    contactRef={contactRef} setHeaderLoaded={setHeaderLoaded} setExperienceReveal={setExperienceReveal} 
    setProjectReveal={setProjectReveal} setContactReveal={setContactReveal} 
    setExperienceFade={setExperienceFade} setProfileFade={setProfileFade} setContactFade={setContactFade} setProjectFade={setProjectFade}
    light={light} handleLight={handleLight}
    />
    {(headerLoaded)?
    <>
    {/* <SideLinks/> */}
    <Intro contactRef={contactRef} setIntroRef={setIntroRef} setAboutRef={setAboutRef} profileFade={profileFade}/>
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