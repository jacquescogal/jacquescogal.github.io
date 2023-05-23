import React,{useEffect, useRef,useState} from 'react'
import logoStyle from '../logo.module.css'
import TGP from '../components/TGP';

const About = ({setAboutRef}) => {
  const [logoText,setLogoText]=useState(">J");
  const [phaseTwo,setPhaseTwo]=useState(false);
    const aboutRef=useRef(null);
    const logoRef=useRef(null);
    useEffect(()=>{
        setAboutRef(aboutRef);
    },[aboutRef])


    document.body.style.overflow="hidden"
    
    const line_class="bg-green-200 "

    
  return (
    <>
    <div ref={aboutRef} className='fixed h-full w-full bg-slate-950 z-50'>
    <div className={(phaseTwo)?logoStyle['logo-group-two']:logoStyle['logo-group']}>
      <div ref={logoRef} className={line_class+" "+logoStyle['btn-line']}/>
      <div className={line_class+" "+logoStyle['btn-line']}/>
      <div className={line_class+" "+logoStyle['btn-line']}/>
      <div className={line_class+" "+logoStyle['btn-line']}/>
      <div className={line_class+" "+logoStyle['btn-line']}/>
      <div className={line_class+" "+logoStyle['btn-line']}/>
      
      <div className={line_class+" "+logoStyle['btn-line']}/>
      
      <div className={line_class+" "+logoStyle['btn-line']}/>
      
      <div className={line_class+" "+logoStyle['btn-line']}/>
      
    
    <TGP toGenerate={logoText} className={"text-green-200 fixed text-left inset-x-0 ms-auto flow-root w-max  "+((phaseTwo)?logoStyle['logo-text-two']:logoStyle['logo-text'])}
    style={{top:`${logoRef.current?.offsetTop}px`,left:`${logoRef.current?.offsetLeft}px`}} onAnimationEnd={()=>{setLogoText(">Jacques Cogal");setPhaseTwo(true)}} quickLeave={false} speed={5}/>
    </div>
    </div>
    
    
</>
  )
}

export default About