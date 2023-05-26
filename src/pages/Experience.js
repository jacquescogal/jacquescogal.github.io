import React, { useEffect, useRef,useState } from 'react'
import TGP from '../components/TGP';

const Experience = ({setExperienceRef}) => {
    const experienceRef=useRef(null);
    useEffect(()=>{
        setExperienceRef(experienceRef);
    },[experienceRef])

    const workExperience=[
      {
        Id:"Deloitte Touché Tohmatsu Limited",
        Role:"Auditor",
        Date:"Dec 2017 - Feb 2018",
        Description:"Conducted financial compliance tests on client's financial records. Performed tasks under audit procedures to ensure reasonable assurance. Handled sensitive financial information with utmost care."
      },
      {
        Id:"Novelship",
        Role:"Business Analyst",
        Date:"May 2022 - Aug 2022",
        Description:"Develoepd and implemented a new KPI utilizing Python Web-scraping and automation. Analyzed other KPI to improve sales in certain demographics. Conducted analytics on market figures to guide future marketing efforts."
      },
      {
        Id:"Zuellig Pharma",
        Role:"Data Analyst",
        Date:"Sep 2022 - Dec 2022",
        Description:"Automated the processing of big and fuzzy data for analytics and machine learning. Research-guided data-cleaning to improve model efficacy."
      },
      {
        Id:"J.P. Morgan",
        Role:"Software Engineer",
        Date:"Jun 2023 - Aug 2023",
        Description:"Yet to be written"
      }
    ]

    const slider = document.querySelector('.parent');
    let mouseDown = false;
    let startX, scrollLeft;

const startDragging = (e)=> {
  e.preventDefault();
  mouseDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
};
const stopDragging = (e)=> {
  e.preventDefault();
  mouseDown = false;
};

const doDrag=(e)=>{
  if(!mouseDown) { return; }
  const x = e.pageX - slider.offsetLeft;
  const scroll = x - startX;
  slider.scrollLeft = scrollLeft + 200;
}



  return (
    <>
    <div ref={experienceRef} className='text-white h-screen w-full flex flex-col '>

    {/* First line */}
    <TGP toGenerate={"Experience"} className={"text-white text-6xl"}/>
    <div className={' scroll-smooth snap-x h-20 rounded-lg bg-slate-950 grid grid-cols-12 gap-96 content-center mx-auto overflow-y-clip  overflow-x-auto w-1/2 parent' } 
    onMouseDown={(e)=>{startDragging(e);}} onMouseUp={(e)=>{stopDragging(e)}} onMouseLeave={(e)=>{stopDragging(e);}} onMouseMove={(e)=>{doDrag(e);}} onscroll={(e)=>{stopDragging(e)}}
    >
      {workExperience.map((exp)=>
        <div className="grid grid-cols-3 gap-96">
        <div className='w-screen bg-black'/>
        <div id={exp.Id} className='snap-center transition transform ease-in-out duration-500 rounded-full h-4 w-40 bg-black  hover:scale-150 ' on>{exp.Id}</div>
        <div className='w-screen bg-black'/>
        </div>
      )}
    </div>
    
    </div>
    </>
  )
}

export default Experience