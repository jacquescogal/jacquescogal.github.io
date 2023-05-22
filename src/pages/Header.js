import React, { useState,useEffect,useCallback,useRef } from 'react'
import menuStyle from '../menu.module.css'
import TGP from '../components/TGP';
import TGS from '../components/TGS';
const Header = ({introRef,aboutRef,experienceRef,projectRef,contactRef}) => {
  const [menuClosed,setMenuClosed]=useState(true);
  const [itemLoad,setitemLoad]=useState(0);
  const [lastScrollY,setLastScrollY]=useState(0);
  const [isOpen,setIsOpen]=useState(true);
  const [forceNav,setForceNav]=useState(false);
  const [forceNavMin,setForceNavMin]=useState(0);
  const navBarRef=useRef(null);


  const menu=[
    
    {id:1,name:'About',ref:aboutRef},
    {id:2,name:'Experiences',ref:experienceRef},
    {id:3,name:'Projects',ref:projectRef},
    {id:4,name:'Contact',ref:contactRef}
  ]

//   For navbar appearing if scroll
  const controlNavbar = useCallback(() => {
    if (typeof window !== 'undefined') {
        if (forceNav && window.scrollY>=forceNavMin){
            setForceNav(false);
        }
        else if (window.scrollY < lastScrollY-1 || window.scrollY<=navBarRef.current.clientHeight*2 || forceNav) {
            setIsOpen(true);
          }
      else if (window.scrollY > lastScrollY+1) {
        setIsOpen(false);
      }
      setLastScrollY(window.scrollY);
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
  },)

  // for scrolling on click
  const handleRefClick = (ref) => {
    const y=ref.current.offsetTop-navBarRef.current.clientHeight;
    setForceNav(true);
    setForceNavMin(y);
    window.scrollTo({top: y, behavior: 'smooth'});
  };

  return (
    <>
    {/* For desktop */}
    <div ref={navBarRef} className={'sticky top-0 transition ease-in-out duration-500 hidden md:block bg-slate-950 backdrop-blur z-50 '+((isOpen)?'translate-y-0':'-translate-y-full')}>
        <div className='grid grid-cols-8'>
        
        {/* Brand */}
        <div className='left-0 pl-20 text-white col-span-1'>
            <TGP toGenerate={"jacques cogal"} className='pt-4 text-left' speed={5} onClick={()=>handleRefClick(introRef)}/>
        </div>

        {/* Holds size */}
        <div className='col-span-1 text-white pt-4 invisible'>Placeholder</div>

        {/* Navigate */}
        <div className={' right-0 col-start-5 col-span-4 grid grid-cols-4 pr-20'}>
            {menu.map((mi)=>
                <p className='flex-none px-8 pt-4 text-left'>
                    <span className='flex-none text-green-300 cursor-default'>{mi.id+"."}</span>
                    <TGS className='flex-none text-white hover:text-green-300 cursor-pointer text-left' onClick={()=>handleRefClick(mi.ref)} toGenerate={mi.name}/>
                </p>
            )}
        </div>
        </div>
    </div>

    {/* For mobile */}
    <div className={'md:hidden'}>
    {/* Backdrop */}
    <div className={'transition ease-in-out duration-500 fixed w-full h-full bg-black '+((menuClosed)?'opacity-0':'opacity-50')}/>
    <div className={'transition ease-in-out duration-500 fixed w-full h-full bg-gradient-to-r from-gray-900 '+((menuClosed)?'opacity-0':'opacity-100')}/>
    {/* the menu buton */}
    <div  className={menuClosed?menuStyle['menu-btn']:menuStyle['menu-btn-close']} onClick={()=>{setMenuClosed(!menuClosed);
    if (itemLoad>0) setitemLoad(0);}}>
            <div className={menuStyle['btn-line']}></div>
            <div className={menuStyle['btn-line']}></div>
            <div className={menuStyle['btn-line']}></div>
    </div>
    {/* Navigation text */}
    <p  className={menuStyle['menu-nav'] + ' transition ease-in-out duration-500' + ((menuClosed)?' opacity-100':' opacity-0')}  onClick={()=>{setMenuClosed(!menuClosed)}}>
        Navigation
    </p>

    {/* The loading of the menu items */}
    <div className={"fixed transform translate-y-16 items-start"}>
    <p className={'transform transition ease-in-out duration-500 text-left origin-left text-4xl py-8 '+ ((!menuClosed && itemLoad>0)?' rotate-0 translate-x-8 opacity-100':'rotate-90 -translate-x-64 translate-y-64 opacity-0')}>
        <span className='cursor-pointer'>Home</span>
    </p>
    <p className={'transform transition ease-in-out duration-500 text-left origin-left text-4xl py-8 '+ ((!menuClosed && itemLoad>1)?' rotate-0 translate-x-8 opacity-100':'rotate-90 -translate-x-64 translate-y-64 opacity-0')}>
        <span className='cursor-pointer'>Experience</span>
    </p>
    <p className={'transform transition ease-in-out duration-500 text-left origin-left text-4xl py-8 '+ ((!menuClosed && itemLoad>2)?' rotate-0 translate-x-8 opacity-100':'rotate-90 -translate-x-64 translate-y-64 opacity-0')}>
        <span className='cursor-pointer'>Achievements</span>
    </p>
    <p className={'transform transition ease-in-out duration-500 text-left origin-left text-4xl py-8 '+ ((!menuClosed && itemLoad>3)?' rotate-0 translate-x-8 opacity-100':'rotate-90 -translate-x-64 translate-y-64 opacity-0')}>
        <span className='cursor-pointer'>Projects</span>
    </p>
    <p className={'transform transition ease-in-out duration-500 text-left origin-left text-4xl py-8 '+ ((!menuClosed && itemLoad>4)?' rotate-0 translate-x-8 opacity-100':'rotate-90 -translate-x-64 translate-y-64 opacity-0')}>
        <span className='cursor-pointer'>Contact me</span>
    </p>
    </div>

    </div>

    </>
  )
}

export default Header