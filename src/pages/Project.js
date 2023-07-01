import React, { useEffect, useRef } from 'react'
import MultilineTGS from '../components/MultilineTGS';

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
    </div>
    </>
  )
}

export default Project