import React, { useState,useEffect,useCallback,useRef } from 'react'
import menuStyle from '../menu.module.css'
import TGP from '../components/TGP';
import TGS from '../components/TGS';
import Logo from '../components/Logo';
const Header = ({introRef,aboutRef,experienceRef,projectRef,contactRef,setHeaderLoaded}) => {
  const [menuClosed,setMenuClosed]=useState(true);
  const [itemLoad,setitemLoad]=useState(0);
  const [lastScrollY,setLastScrollY]=useState(0);
  const [isOpen,setIsOpen]=useState(true);
  const [forceNav,setForceNav]=useState(false);
  const [forceNavMin,setForceNavMin]=useState(0);
  const navBarRef=useRef(null);


  const menu=[
    
    {id:1,name:'Profile',ref:aboutRef},
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
  },[menuClosed,itemLoad])

  // for scrolling on click
  const handleRefClick = (ref) => {
    const y=ref.current.offsetTop-navBarRef.current.clientHeight;
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
    <div ref={navBarRef} className={'sticky top-0 transition ease-in-out duration-500 block bg-slate-950 backdrop-blur z-40 '+((isOpen)?'translate-y-0':'-translate-y-full')}>
    <div className='left-32 top-0 fixed pt-4'>
            <Logo />
        </div>
        
        <div className='grid grid-cols-8'>

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

    </>
  )
}

export default Header