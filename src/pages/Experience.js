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
    let toRight;
    let snapTo=0;
    let startVelocity=0;
    let dragged=false;
  
    const dragMouseDownHandler=(e)=>{
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      startVelocity=0;
      dragged=false;
      cancelMomentumTracking();
    }

    const dragMouseLeaveHandler=()=>{
      if (isDown){
      isDown = false;
      slider.classList.remove('active');
      beginMomentumTracking();
      }
    }

    const dragMouseUpHandler=()=>{
      if (isDown){
      isDown = false;
      slider.classList.remove('active');
      beginMomentumTracking();
      }
    }
    
    const dragMouseMoveHandler=(e)=>{
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; //scroll-fast
      var prevScrollLeft = slider.scrollLeft;
      slider.scrollLeft = scrollLeft - walk;
      velX = slider.scrollLeft - prevScrollLeft;
      startVelocity=Math.abs(velX);
      dragged=true;
      if (velX>0) toRight=true;
      else toRight=false;
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
      if (dragged==true) {
      slider.scrollLeft += velX;
      velX *= 0.95; 
      }
      if (dragged==true && Math.abs(velX) > 1){
        momentumID = requestAnimationFrame(momentumLoop);
      }
      else if ((toRight && startVelocity>5) || (!toRight && startVelocity<=5)){
        for (const mark in scrollMarks){
          if (scrollMarks[mark]>slider.scrollLeft-elementDiff/4){
            snapTo=scrollMarks[mark];
            break;
          }
          else if (scrollMarks[mark]>slider.scrollLeft){
            snapTo=scrollMarks[mark];
            break;
          }
          else snapTo=scrollMarks[mark];
        }
        toRight=true;
        velX=(snapTo-slider.scrollLeft)/20;
        momentumID = requestAnimationFrame(snapMomentum);
      }
      else if ((!toRight && startVelocity>5) || (toRight && startVelocity<=5)){
        snapTo=scrollMarks[0];
        for (const mark in scrollMarks){
          if (scrollMarks[mark]<slider.scrollLeft+elementDiff/4){
            snapTo=scrollMarks[mark];
          }
          else if (scrollMarks[mark]>slider.scrollLeft){
            break;
          }
          else snapTo=scrollMarks[mark];
        }
        toRight=false;
        velX=(snapTo-slider.scrollLeft)/20;
        momentumID = requestAnimationFrame(snapMomentum);
      }
    }

    function snapMomentum(){
      if (toRight) {
        velX = Math.max(velX*0.98,0.2); 
        slider.scrollLeft = Math.min(slider.scrollLeft+velX,snapTo);
      }
      else {
        velX = Math.min(velX*0.98,-0.2); 
        slider.scrollLeft = Math.max(slider.scrollLeft+velX,snapTo);
      }
      if (Math.abs(snapTo-slider.scrollLeft)>0){
        momentumID = requestAnimationFrame(snapMomentum);
      }
    }

     const handleScroll = (event) => {
        const { scrollWidth, scrollLeft, clientWidth } = event.currentTarget;
        const scroll = scrollWidth - scrollLeft - clientWidth
        const mid=scrollLeft+clientWidth/2;
        console.log(mid);
    }
    const [scrollMarks,setScrollMarks]=useState([]);
    const scrollRefs=useRef([])
    const [elementDiff,setElementDiff]=useState(0);

    useEffect(()=>{
      const scrollMarks=[]
      for (var i=0;i<scrollRefs.current.length;++i){
        scrollMarks[i]=scrollRefs.current[i]?.offsetLeft+scrollRefs.current[i]?.clientWidth/2-window.innerWidth/2
      }
      if (scrollRefs.current.length>1){
        setElementDiff(scrollRefs.current[1]?.offsetLeft-scrollRefs.current[0]?.offsetLeft);
      }
      setScrollMarks(scrollMarks)
    },[scrollRefs])

  return (
    <>
    <div ref={experienceRef} className='bg-black flex flex-col h-80 '>

    {/* First line */}
    <TGP toGenerate={"Experience"} className={"text-white text-6xl"}/>

    <div class="items h-40" 
      onMouseDown={(e)=>{dragMouseDownHandler(e)}}
      onMouseLeave={()=>{dragMouseLeaveHandler()}}
      onMouseUp={(e)=>{dragMouseUpHandler()}}
      onWheel={()=>{cancelMomentumTracking()}}
      onMouseMove={(e)=>{dragMouseMoveHandler(e)}}
      >
        <div className='drag-line  bg-green-200'
        style={{width:`${scrollRefs.current[scrollRefs.current.length-1]?.offsetLeft-scrollRefs.current[0]?.offsetLeft}px`}}></div>
      {workExperience.map((exp,i)=>
      <>
        <div id={i} ref={ref => (scrollRefs.current[i] = ref)} className=' drag-item rounded-full bg-green-200  hover:scale-110'
        style={{transform: `translateY(${50}%) `+((true)?`scale(5)`: `scale(2)`),transformOrigin:'center'}}
        >
          <p className='absolute top-screen text-white'>{i}</p>
          </div>
        </>
      )}


    </div>

    <div class="items h-40" 
      >
        <div className='drag-line  bg-green-200'
        style={{width:`${scrollRefs.current[scrollRefs.current.length-1]?.offsetLeft-scrollRefs.current[0]?.offsetLeft}px`}}></div>
      {workExperience.map((exp,i)=>
      <>
        <div id={i} className=' drag-item rounded-full bg-green-200  hover:scale-110'
        style={{transform: `translateY(${50}%) `+((true)?`scale(5)`: `scale(2)`),transformOrigin:'center'}}
        >
          <p className='absolute top-screen text-white'>{i}</p>
          </div>
        </>
      )}


    </div>
    
    </div>
    </>
  )
}

export default Experience