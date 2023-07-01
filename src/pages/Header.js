import React, { useState,useEffect,useCallback,useRef } from 'react'

import TGS from '../components/TGS';
import Logo from '../components/Logo';
import Profile_logo from '../svg/Profile_logo';
import Exp_logo from '../svg/Exp_logo';
import Proj_logo from '../svg/Proj_logo';
import Contact_logo from '../svg/Contact_logo';
import '../header.css'
import Sun_logo from '../svg/sun_logo';
import Moon_logo from '../svg/Moon_logo';
const Header = ({introRef,aboutRef,experienceRef,projectRef,contactRef,setHeaderLoaded,setExperienceReveal,setContactReveal,setProjectReveal,setExperienceFade,setProfileFade,setProjectFade,setContactFade,light,handleLight}) => {
  const [menuClosed,setMenuClosed]=useState(true);
  const [itemLoad,setitemLoad]=useState(0);
  const [lastScrollY,setLastScrollY]=useState(0);
  const [isOpen,setIsOpen]=useState(true);
  const [forceNav,setForceNav]=useState(false);
  const [forceNavMin,setForceNavMin]=useState(0);
  const [closable,setClosable]=useState(true);
  const navBarRef=useRef(null);
  const smallBarRef=useRef(null);
  const stickerRef=useRef(null);
  const [isActiveRegion,setIsActiveRegion]=useState(
    {
      profile:true,
      experiences:false,
      projects:false,
      contact:false
    }
  )


  const menu=[
    
    {id:1,name:'profile',ref:introRef,setReveal:function(){},setFade:function(bool){setProfileFade(bool);setIsActiveRegion(isActiveRegion=>({...isActiveRegion,profile:!bool}));}},
    {id:2,name:'experiences',ref:experienceRef,setReveal:function(){setExperienceReveal(true)},setFade:function(bool){setExperienceFade(bool);setIsActiveRegion(isActiveRegion=>({...isActiveRegion,experiences:!bool}));}},
    {id:3,name:'projects',ref:projectRef,setReveal:function(){setProjectReveal(true)},setFade:function(bool){setProjectFade(bool);setIsActiveRegion(isActiveRegion=>({...isActiveRegion,projects:!bool}));}},
    {id:4,name:'contact',ref:contactRef,setReveal:function(){setContactReveal(true)},setFade:function(bool){setContactFade(bool);setIsActiveRegion(isActiveRegion=>({...isActiveRegion,contact:!bool}));}}
  ]

//   For navbar appearing if scroll
  const controlNavbar = useCallback(() => {
    if (typeof window !== 'undefined') {
        if (forceNav && window.scrollY>=forceNavMin){
            setForceNav(false);
        }
        else if (window.scrollY < lastScrollY-1 || window.scrollY<=Math.max(smallBarRef.current?.clientHeight,navBarRef.current?.clientHeight)*2 || forceNav) {
            setIsOpen(true);
          }
      else if (window.scrollY > lastScrollY+1) {
        setIsOpen(true);
      }
      setLastScrollY(window.scrollY);
      menu.forEach((i)=>{
        if (i.ref.current?.offsetTop-(3*window.innerHeight/5)<window.scrollY) {
          i.setReveal();
        }
        if (i.ref.current?.offsetTop+i.ref.current?.clientHeight-(window.innerHeight/2)>window.scrollY
        && i.ref.current?.offsetTop-(window.innerHeight/2)<window.scrollY){
          i.setFade(false);
        }
        else{
          i.setFade(true)
        }
      })
    }
  }, [lastScrollY]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
  
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [controlNavbar]);


// For menu to stop loading in after 5 for drawer
  useEffect(()=>{
    if (menuClosed || itemLoad>=5) return;
    const timeout=setTimeout(()=>{setitemLoad(itemLoad+1);console.log(itemLoad)},100);
    return ()=>clearTimeout(timeout);
  },[menuClosed,itemLoad])

  // for scrolling on click
  const handleRefClick = (ref) => {
    const y=ref.current.offsetTop-Math.max(navBarRef.current?.clientHeight,smallBarRef.current?.clientHeight)-((!closable)?stickerRef.current?.clientHeight:0);
    setForceNav(true);
    setForceNavMin(y);
    window.scrollTo({top: y, behavior: 'smooth'});
  };

  //Check header loaded to prevent jumping
  useEffect(()=>{
    const timeout=setTimeout(()=>{
      setHeaderLoaded(true);
    },0)
    return ()=>clearTimeout(timeout);
  },[])

  return (
    <>
    {/* For desktop */}
    <div ref={navBarRef} className={'sticky top-0 transition ease-in-out duration-500 block header-background backdrop-blur z-40 hidden xl:block '+((isOpen)?'translate-y-0':'-translate-y-full')}>
    <div className='logo-holder'>
            <Logo onClick={()=>{handleRefClick(menu[0].ref)}}/>
        </div>
        
        <div className='grid grid-cols-8'>

        {/* Holds size */}
        <div className='col-span-1 text-white py-4 invisible'>Placeholder</div>

        {/* Navigate */}
        <div className={' right-0 col-start-5 col-span-4 grid grid-cols-11 pr-20 ' }>
        
            {menu.map((mi)=>
                <p className={isActiveRegion[mi.name]?' col-span-2 mx-8 mt-4 text-left header-holder active':'col-span-2 mx-8 mt-4 text-left header-holder'} onClick={()=>handleRefClick(mi.ref)}>
                    <span className='header-id-color'>{mi.id+"."}</span>
                    <TGS className='header-text text-left'  toGenerate={mi.name}/>
                    <div className='header-underline'></div>
                    <div className='header-underline-back'></div>
                </p>
            )}
            {(light)?<Moon_logo className={"moon"} onClick={handleLight}/>:
            <Sun_logo className={"sun"} onClick={handleLight}/>
            
}
        </div>
        </div>
    </div>

    <div ref={smallBarRef} className={'sticky top-0 transition ease-in-out duration-500 block header-background backdrop-blur z-40 block xl:hidden '+((isOpen || !closable)?'translate-y-0':'-translate-y-full')}>
    <div className='logo-holder'>
            <Logo onClick={()=>{handleRefClick(menu[0].ref)}} />
        </div>
        
        <div className='grid grid-cols-8'>

        {/* Holds size */}
        <div className='col-span-1 text-white pt-4 invisible'>Placeholder</div>

        {/* Navigate */}
        <button className='bg-white  lighter'>a</button>

        <div class="menu-btn btn-center" onClick={(e)=>{e.currentTarget.classList.toggle('close');stickerRef.current?.classList.toggle('sticker-open');setClosable(!closable);}}>
          <span/>
          <span/>
          <span/>
          </div>

        </div>
    </div>
    <div ref={stickerRef} className={'sticker-holder top-0 transition ease-in-out duration-500 block backdrop-blur z-30 block xl:hidden '}>
    

        {/* Holds size */}
        {/* <div className='col-span-1 text-white pt-4 invisible'>Placeholder</div> */}
        <div className='flex flex-row justify-center mx-0'>
          <Profile_logo className={isActiveRegion["profile"]?" sticker w-12 h-12 fill-white":" sticker w-12 h-12 fill-green-200"} onClick={()=>handleRefClick(introRef)}/>
          <Exp_logo className={isActiveRegion["experiences"]?" sticker w-12 h-12 fill-white":" sticker w-12 h-12 fill-green-200"} onClick={()=>handleRefClick(experienceRef)}/>
          <Proj_logo className={isActiveRegion["projects"]?" sticker w-12 h-12 fill-white":" sticker w-12 h-12 fill-green-200"} onClick={()=>handleRefClick(projectRef)}/>
          <Contact_logo className={isActiveRegion["contact"]?" sticker w-12 h-12 fill-white":" sticker w-12 h-12 fill-green-200"} onClick={()=>handleRefClick(contactRef)}/>
        </div>

        {/* Navigate */}

    </div>

    </>
  )
}

export default Header