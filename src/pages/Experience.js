import React, { useEffect, useRef,useState } from 'react'
import TGP from '../components/TGP';
import useScrollSnap from "react-use-scroll-snap";

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

    
    let isDown = false;
    let startX;
    let scrollLeft;
    let toRight;
    let snapTo=0;
    let startVelocity=0;
    let dragged=false;
  
    const dragMouseDownHandler=(e)=>{
      setUseTouch(false)
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
      // slider.classList.remove('active');
      beginMomentumTracking();
      }
    }

    const dragMouseUpHandler=()=>{
      if (isDown){
      isDown = false;
      // slider.classList.remove('active');
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
    const slider = document.querySelector('.items');
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
      //Need:
      //velX , dragged, toRight, startVelocity, 
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
      console.log(snapTo,scrollMarks,velX,slider.scrollLeft)
      if (toRight) {
        velX = Math.max(velX*0.98,10); 
        slider.scrollLeft = Math.min(slider.scrollLeft+velX,snapTo);
      }
      else {
        velX = Math.min(velX*0.98,-10); 
        slider.scrollLeft = Math.max(slider.scrollLeft+velX,snapTo);
      }
      if (Math.abs(snapTo-slider.scrollLeft)>0){
        momentumID = requestAnimationFrame(snapMomentum);
      }
    }

    // legacy support for intersection observer not being available
    //  const handleScroll = (e) => {
    //   var atSnappingPoint = e.target.scrollLeft % e.target.offsetWidth === 0;
    //   var timeOut         = atSnappingPoint ? 0 : 150; //see notes
    //   currentHighlight?.classList.remove('active');
    //   if (isDown) return

    //   clearTimeout(e.target.scrollTimeout); //clear previous timeout
  
    //   e.target.scrollTimeout = setTimeout(function() {
    //       console.log('Scrolling stopped!');
    //       let i;
    //       for (i=0;i<scrollMarks.length;++i){
    //         if (scrollMarks[i]==e.target.scrollLeft) break;
    //       }
    //       scrollRefs.current[i]?.classList.add('active')
    //       setCurrentHighlight(scrollRefs.current[i]);
    //   }, timeOut);
    // }
    const [scrollMarks,setScrollMarks]=useState([]);
    const scrollRefs=useRef([])
    const [elementDiff,setElementDiff]=useState(0);

    useEffect(()=>{
      dragLineSizer();
    },[scrollRefs])

    const dragLineSizer=()=>{
      console.log(window.innerWidth,window.innerHeight)
      const scrollMarks=[]
      for (var i=0;i<scrollRefs.current.length;++i){
        scrollMarks[i]=scrollRefs.current[i]?.offsetLeft+scrollRefs.current[i]?.clientWidth/2-window.innerWidth/2
      }
      if (scrollRefs.current.length>1){
        setElementDiff(scrollRefs.current[1]?.offsetLeft-scrollRefs.current[0]?.offsetLeft);
      }
      setScrollMarks(scrollMarks)
    }

    const [useTouch,setUseTouch]=useState(false);

    const handleIntersectionObserver = ()=>{
      let options = {
        root: document.getElementById("drag-hold"),
        rootMargin: '0px -40% 0px -40%', //top-right-bottom-left
        threshold: 0
      }
      //Target define
      const targets = document.getElementById("drag-hold").querySelectorAll(".drag-item")
      //Define observer
      const activeHeader = (target)=>{
        const headerObserver = new IntersectionObserver((entries,observer)=>{
          entries.forEach(entry=>{
            if (entry.isIntersecting){
              entry.target.classList.add('active')
            }
            else{
              entry.target.classList.remove('active')
            }
          })
          observer.disconnect()
        },options)
        headerObserver.observe(target)
      }
  
      //Loop through targets
      targets.forEach(activeHeader)
    }
  
    useEffect(()=>{
      handleIntersectionObserver();
    },[])

    window.addEventListener("resize", (e)=>{
      console.log("HELLO")
      clearTimeout(e.target.resizeTimeout);
      e.target.resizeTimeout=setTimeout(()=>{
        console.log("resize")
        dragLineSizer()
      },500);
    });
  return (
    <>
    <div ref={experienceRef} className='flex flex-col h-80 '>

    {/* First line */}
    <TGP toGenerate={"Experience"} className={"text-white text-6xl"}/>

    <div id='drag-hold' className={"items bg-slate-950 "+((useTouch)? " snap-mandatory snap-x ":"")} 
      onMouseDown={(e)=>{setUseTouch(false);dragMouseDownHandler(e);}}
      onMouseLeave={()=>{dragMouseLeaveHandler()}}
      onMouseUp={(e)=>{dragMouseUpHandler()}}
      onWheel={()=>{cancelMomentumTracking();setUseTouch(true)}}
      onMouseMove={(e)=>{dragMouseMoveHandler(e)}}
      onTouchStart={()=>{setUseTouch(true)}}
      onScroll={(e)=>{handleIntersectionObserver()}}
      >
        <div className='drag-line  bg-green-200'
        style={{width:`${scrollRefs.current[scrollRefs.current.length-1]?.offsetLeft-scrollRefs.current[0]?.offsetLeft}px`}}></div>
      {workExperience.map((exp,i)=>
      <>
        <div key={i}  id={exp.Id} ref={ref => (scrollRefs.current[i] = ref)} className=' drag-item rounded-full bg-green-200 snap-center '
        >
          <div className='absolute bg-white h-12 w-12 top-12'>
          <p className='absolute top-screen text-white'>{i}</p>
          </div>
          </div>
        </>
      )}
    </div>
    </div>
    </>
  )
}

export default Experience