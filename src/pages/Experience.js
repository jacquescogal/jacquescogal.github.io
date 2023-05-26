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

    const slider = document.querySelector('.items');
    let isDown = false;
    let startX;
    let scrollLeft;
  
    const dragMouseDownHandler=(e)=>{
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      cancelMomentumTracking();
    }

    const dragMouseLeaveHandler=()=>{
      isDown = false;
      slider.classList.remove('active');
    }

    const dragMouseUpHandler=()=>{
      isDown = false;
      slider.classList.remove('active');
      beginMomentumTracking();
    }
    
    const dragMouseMoveHandler=(e)=>{
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3; //scroll-fast
      var prevScrollLeft = slider.scrollLeft;
      slider.scrollLeft = scrollLeft - walk;
      velX = slider.scrollLeft - prevScrollLeft;
    }
    
    
    // Momentum 
    
    var velX = 0;
    var momentumID;
    
    function beginMomentumTracking(){
      cancelMomentumTracking();
      momentumID = requestAnimationFrame(momentumLoop);
    }
    function cancelMomentumTracking(){
      cancelAnimationFrame(momentumID);
    }
    function momentumLoop(){
      slider.scrollLeft += velX;
      velX *= 0.95; 
      if (Math.abs(velX) > 0.5){
        momentumID = requestAnimationFrame(momentumLoop);
      }
    }




  return (
    <>
    <div ref={experienceRef} className='text-white  '>

    {/* First line */}
    <TGP toGenerate={"Experience"} className={"text-white text-6xl"}/>

    <div class="items " 
      onMouseDown={(e)=>{dragMouseDownHandler(e)}}
      onMouseLeave={()=>{dragMouseLeaveHandler()}}
      onMouseUp={()=>{dragMouseUpHandler()}}
      onWheel={()=>{cancelMomentumTracking()}}
      onMouseMove={(e)=>{dragMouseMoveHandler(e)}}>
      {workExperience.map((exp)=>
        <div id={exp.Id} className=' item mx-40 '>{exp.Id}</div>
      )}
    </div>
    
    </div>
    </>
  )
}

export default Experience