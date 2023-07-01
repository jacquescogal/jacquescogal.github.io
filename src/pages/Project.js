import React, { useEffect, useRef } from 'react'
import MultilineTGS from '../components/MultilineTGS';
import Proj_logo from '../svg/Proj_logo';
import TGS from '../components/TGS';

const Project = ({setProjectRef,projectReveal,projectFade}) => {
    const projectRef=useRef(null);
    useEffect(()=>{
        setProjectRef(projectRef);
    },[projectRef])

    const blockSelect = document.querySelector('.section-block.project-block');

    useEffect(()=>{
      if (projectReveal){
        blockSelect?.classList.remove('hide')
        blockSelect?.classList.add('show')
      }
    },[projectReveal])

    useEffect(() => {
      if (projectFade) {
        blockSelect?.classList.add('fade')
      }
      else{
        blockSelect?.classList.remove('fade')
      }
    }, [projectFade])

  return (
    < >
    <div className='section-block project-block hide' ref={projectRef}>
    <p className='flex-none px-8 pt-4 text-left title-comp intro-load'>
    <span className='text-green-300 text-4xl' >3.</span>
    <MultilineTGS toGenerateMap={["Projects"," (Under construction. Will be done soon!)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    <Proj_logo className={" h-80   fill-green-200 "}/>
    <TGS toGenerate={"Constructing..."} className={"text-white "} speed={10}/>
    </div>
    </>
  )
}

export default Project