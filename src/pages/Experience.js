import React, { useEffect, useRef, useState, createRef } from 'react'
import TGP from '../components/TGP';
import useScrollSnap from "react-use-scroll-snap";

import '../drag.scss';
import TGS from '../components/TGS';
import MultilineTGS from '../components/MultilineTGS';

const Experience = ({ setExperienceRef, experienceReveal,experienceFade }) => {

  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [activeGroup, setActiveGroup] = useState("work")

  const experienceRef = useRef(null);
  useEffect(() => {
    setExperienceRef(experienceRef);
  }, [experienceRef])

  const workExperience = [
    {
      Id: "Deloitte Touché Tohmatsu",
      Role: "Audit Intern",
      Date: "Dec 2017 - Feb 2018",
      Description: "Conducted financial compliance tests on client's financial records. Performed tasks under audit procedures to ensure reasonable assurance. ",
      imageURL: require('../images/deloitte_logo.jpg'),
      logos: [{ Id: "MS Office", imageURL: require("../images/ms_logo.jpg") }]
    },
    {
      Id: "Novelship",
      Role: "Business Analyst Intern",
      Date: "May 2022 - Aug 2022",
      Description: "Developed and implemented a new KPI utilizing Python from Web-scraping and automation. Analyzed figures to guide future efforts.",
      imageURL: require('../images/novelship_logo.jpg'),
      logos: [{ Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "Tableau", imageURL: require("../images/tb_logo.jpg") }, { Id: "MS Office", imageURL: require("../images/ms_logo.jpg") }]
    },
    {
      Id: "Zuellig Pharma",
      Role: "Data Analyst Part-Timer",
      Date: "Sep 2022 - Dec 2022",
      Description: "Automated processing of big, fuzzy data for analytics and machine learning. Research-guided data-cleaning to improve predictive model efficacy.",
      imageURL: require('../images/zp_logo.jpg'),
      logos: [{ Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "PostgreSQL", imageURL: require("../images/psql_logo.png") }, { Id: "Spyder", imageURL: require("../images/spyd_logo.png") }, { Id: "MS Office", imageURL: require("../images/ms_logo.jpg") }]
    },
    {
      Id: "J.P. Morgan",
      Role: "Software Engineer Intern",
      Date: "Jun 2023 - Aug 2023",
      Description: "Financial Crimes Team",
      imageURL: require('../images/jpm_logo.png'),
      logos: []
    },
    {
      Id: "CPF Board",
      Role: "Software Engineer Intern",
      Date: "Dec 2023 - Present",
      Description: "Involved in projects relating to large language models and data engineering | Optimised information retrieval of customer-facing internal search engine, improving search relevance by up to 10%|Streamlined search index creation with azure functions",
      imageURL: require('../images/cpf_logo.png'),
      logos: []
    }
  ]

  const schoolExperience = [
    {
      Id: "Temasek Polytechnic",
      Role: "Accounting and Finance Diploma Student",
      Date: "Apr 2015 - Apr 2018",
      Description: "Diploma plus with merit and a CGPA of 3.93/4.00.",
      imageURL: require('../images/tp_logo.png'),
      logos: [{ Id: "MS Office", imageURL: require("../images/ms_logo.jpg") }]
    },
    {
      Id: "Nanyang Technological University",
      Role: "Business and Computing Double Degree Undergraduate",
      Date: "Aug 2020 - Present (Expected Graduation: May 2024)",
      Description: "Dean’s List (BUS) AY2022/2023",
      imageURL: require('../images/ntu_logo.jpg'),
      logos: [{ Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "Java", imageURL: require("../images/java_logo.png") }, { Id: "C++", imageURL: require("../images/cpp_logo.png") }, { Id: "React", imageURL: require("../images/react_logo.png") }, { Id: "R", imageURL: require("../images/r_logo.png") }, { Id: "MySQL", imageURL: require("../images/mysql_logo.png") }, { Id: "mongoDB", imageURL: require("../images/mongo_logo.png") }]
    }
  ]

  const notableAchievements = [
    {
      Id: "Deloitte BA Hackathon - 2nd Runner-up",
      Role: "Red-pill group leader",
      Date: "Feb 2022",
      Description: "Analyzed faux bank financial statements for fraud and impressed by implementing machine learning models in multi-faceted solution.",
      imageURL: require('../images/pill_logo.png'),
      logos: [{ Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "Anaconda", imageURL: require("../images/anaconda_logo.png") }, { Id: "MS Office", imageURL: require("../images/ms_logo.jpg") }]
    },
    {
      Id: "J.P. Morgan Code For Good 2022 - Champions",
      Role: "Front-end developer",
      Date: "Oct 2022",
      Description: "Developed and demonstrated comprehensive methods and supporting systems to address client's bottleneck in query processing.",
      imageURL: require('../images/cfg_team_logo.jpg'),
      logos: [{ Id: "React", imageURL: require("../images/react_logo.png") }, { Id: "Node JS", imageURL: require("../images/njs_logo.png") }, { Id: "Heroku", imageURL: require("../images/Heroku_logo.png") }]
    },
    {
      Id: "J.P. Morgan Global Hackathon - Singapore 2023 - Champions",
      Role: "Team lead",
      Date: "Jun 2023",
      Description: "Developed innovative POC for internal users.",
      imageURL: require('../images/gh_logo.jpg'),
      logos: [{ Id: "React", imageURL: require("../images/react_logo.png") }, { Id: "Node JS", imageURL: require("../images/njs_logo.png") }, { Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "AWS", imageURL: require("../images/aws_logo.png") }]
    },
    {
      Id: "GIC Code To impact - Champions",
      Role: "Devops, Full-stack and GenAI Team Lead",
      Date: "Sep 2023",
      Description: "Built analytics application with generative AI capabilities.|Leveraged AWS Kendra for novel Retrieval Augmented Generation (RAG) implementation",
      imageURL: require('../images/gic_logo.png'),
      logos: [{ Id: "React", imageURL: require("../images/react_logo.png") }, { Id: "Node JS", imageURL: require("../images/njs_logo.png") }, { Id: "Python", imageURL: require("../images/python_logo.png") }, { Id: "AWS", imageURL: require("../images/aws_logo.png") }]
    }
    
  ]

  const [loadThis, setLoadThis] = useState(workExperience)


  let isDown = false;
  let startX;
  let scrollLeft;
  let snapTo = 0;

  const dragMouseDownHandler = (e) => {
    setUseTouch(false)
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    cancelMomentumTracking();
  }

  const dragMouseLeaveHandler = () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('active');
      beginMomentumTracking();
    }
  }

  const dragMouseUpHandler = () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('active');
      beginMomentumTracking();
    }
  }

  const dragMouseMoveHandler = (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; //scroll-fast
    var prevScrollLeft = slider.scrollLeft;
    slider.scrollLeft = scrollLeft - walk;
    velX = slider.scrollLeft - prevScrollLeft;
    clearTimeout(e.target.dragTimeout);
    e.target.dragTimeout = setTimeout(() => {
      dragMouseUpHandler();
    }, 150)
  }


  // Momentum 
  const slider = document.querySelector('.items');
  var velX = 0;
  var momentumID;
  const [activeNode, setActiveNode] = useState(null);

  function beginMomentumTracking() {
    cancelMomentumTracking();
    momentumID = requestAnimationFrame(snapMomentum);
  }
  function cancelMomentumTracking() {
    cancelAnimationFrame(momentumID);
  }

  function snapMomentum() {
    snapTo = scrollMarks[0];
    for (const mark in scrollMarks) {
      if (Math.abs(scrollMarks[mark] - slider.scrollLeft) < elementDiff / 2) {
        snapTo = scrollMarks[mark];
        break;
      }
      else snapTo = scrollMarks[mark];
    }
    slider.scrollTo({ left: snapTo, behavior: 'smooth' })
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
  const [scrollMarks, setScrollMarks] = useState([]);
  const scrollRefs = useRef([])
  const [elementDiff, setElementDiff] = useState(0);

  useEffect(() => {
    dragLineSizer();
  }, [scrollRefs, loadThis])

  const dragLineSizer = () => {
    const scrollMarks = []
    for (var i = 0; i < scrollRefs.current.length; ++i) {
      scrollMarks[i] = scrollRefs.current[i]?.offsetLeft + scrollRefs.current[i]?.clientWidth / 2 - window.innerWidth / 2
    }
    if (scrollRefs.current.length > 1) {
      setElementDiff(scrollRefs.current[1]?.offsetLeft - scrollRefs.current[0]?.offsetLeft);
    }
    setScrollMarks(scrollMarks)

  }

  const [useTouch, setUseTouch] = useState(false);

  const handleIntersectionObserver = () => {
    let options = {
      root: document.getElementById("drag-hold"),
      rootMargin: '0px -40% 0px -40%', //top-right-bottom-left
      threshold: 0
    }
    //Target define
    const targets = document.getElementById("drag-hold").querySelectorAll(".drag-item")
    //Define observer
    const activeHeader = (target) => {
      const headerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            // setActiveNode(entry.target.getAttribute("id"))
          }
          else {
            entry.target.classList.remove('active')
          }
        })

        observer.disconnect()
      }, options)
      headerObserver.observe(target)
    }

    //Loop through targets
    targets.forEach(activeHeader)
  }

  useEffect(() => {
    handleIntersectionObserver();
  }, [loadThis])

  const scrollReset = () => {
    if (scrollMarks.length == scrollRefs.current.length) {
      slider?.scrollTo({ left: scrollRefs.current[scrollRefs.current.length - 1]?.offsetLeft + scrollRefs.current[scrollRefs.current.length - 1]?.clientWidth / 2 - window.innerWidth / 2, behavior: 'smooth' });
      setActiveNode(scrollMarks.length - 1);
    }
  }

  useEffect(() => {
    scrollReset();
  }, [scrollMarks, loadThis])

  window.addEventListener("resize", (e) => {
    clearTimeout(e.target.resizeTimeout);
    e.target.resizeTimeout = setTimeout(() => {
      console.log("resize")
      dragLineSizer()
    }, 500);
  });

  const handleWheel = (e) => {
    clearTimeout(e.target.wheelTimeout)
    e.target.wheelTimeout = setTimeout(() => {
      momentumID = requestAnimationFrame(snapMomentum);
    }, 100)
  }

  const [disableChange, setDisableChange] = useState(false);

  var loadTimeout = null;


  const loadAnim = () => {
    if (slider) {
      slider.classList.add('animate');
      setDisableChange(true);
      clearTimeout(loadTimeout)
      loadTimeout = setTimeout(() => {
        slider.classList.remove('animate');
        setDisableChange(false);
      }, 1000)
      // If updating timeout time, update css
    }
  }

  useEffect(() => {
    scrollRefs.current = [];
    loadAnim();
  }, [loadThis, slider])

  useEffect(() => {
    if (experienceReveal) {
      setActiveGroup("work"); setActiveNode(0); setLoadThis(workExperience);
    }
  }, [experienceReveal])

  const blockSelect = document.querySelector('.section-block.experience-main');

  useEffect(() => {
    if (experienceReveal) {
      blockSelect?.classList.remove('hide')
      blockSelect?.classList.add('show')
    }
  }, [experienceReveal])

  useEffect(() => {
    if (experienceFade) {
      blockSelect?.classList.add('fade')
    }
    else{
      blockSelect?.classList.remove('fade')
    }
  }, [experienceFade])

  const [popupImage,setPopupImage]=useState(workExperience[1]["imageURL"]);
  const ipPop=document.querySelector(".image-popup")
  const experienceImageHandler=({imageURL=null,show=null})=>{
    if (imageURL!=null){
      setPopupImage(imageURL);
    }
    if (show==null){
      ipPop.classList.toggle('show')
    }
    else if (show==true){
      ipPop.classList.add('show')
    }
    else if (show==false){
      ipPop.classList.remove('show')
    }
    
  }
  return (
    <>
      <div ref={experienceRef} className="section-block experience-main hide">


        {/* First line */}
        <p className='title-comp flex-none px-8 pt-4 text-left section-block'>
          <span className='section-text text-4xl  '>2.</span>
          <MultilineTGS toGenerateMap={["Experience", " (Custom carousel: Traverse by dragging/click drag)"]} classNameMap={["number-text", "flair-text"]} observable={experienceReveal} />
        </p>
        <div className='button-group'>
          <button className={'button-child h-8 px-4 rounded-xl noselect ' + ((activeGroup == "work") ? "  button-active no-click  " : (disableChange) ? " bg-gray-500" : " ") + ((disableChange) ? " no-click" : "")} onClick={() => { setActiveGroup("work");experienceImageHandler({show:false}); setActiveNode(0); setLoadThis(workExperience); }}>Work</button>
          <button className={'button-child h-8 px-4 rounded-xl noselect ' + ((activeGroup == "notables") ? " button-active no-click " : (disableChange) ? " bg-gray-500" : " ") + ((disableChange) ? " no-click" : "")} onClick={() => { setActiveGroup("notables");experienceImageHandler({show:false}); setActiveNode(0); setLoadThis(notableAchievements); }}>Hackathons</button>
          <button className={'button-child h-8 px-4 rounded-xl noselect ' + ((activeGroup == "school") ? " button-active no-click  " : (disableChange) ? " bg-gray-500" : " ") + ((disableChange) ? " no-click" : "")} onClick={() => { setActiveGroup("school");experienceImageHandler({show:false}); setActiveNode(0); setLoadThis(schoolExperience); }}>Education</button>
        </div>
        <div className='image-popup' onClick={()=>{experienceImageHandler({})}}>
          <div className='ip-dark'/>
          <img src={popupImage} className='ip-image'/>
        </div>
        <div id='drag-hold' className={"items bg-slate-950 " + ((useTouch) ? " snap-mandatory snap-x " : "")}
          onMouseDown={(e) => { setUseTouch(false); dragMouseDownHandler(e); }}
          onMouseLeave={() => { dragMouseLeaveHandler() }}
          onMouseUp={(e) => { dragMouseUpHandler() }}
          onWheel={(e) => { handleWheel(e) }}
          onMouseMove={(e) => { dragMouseMoveHandler(e) }}
          onTouchStart={() => { setUseTouch(true) }}
          onScroll={(e) => { handleIntersectionObserver() }}
        >
          <div className='drag-line '
            style={{ width: `${scrollRefs.current[scrollRefs.current.length - 1]?.offsetLeft - scrollRefs.current[0]?.offsetLeft}px` }}></div>
          {loadThis.map((exp, i) =>
            <>
              <div key={i} id={exp.Id} ref={ref => (scrollRefs.current[i] = ref)} className=' drag-item snap-center '
                onLoadCapture={() => { setLoadThis(loadThis); dragLineSizer() }}
                onAnimationEnd={() => { dragLineSizer(); scrollReset() }}
              >
                <p className='drag-title'>{exp.Id}</p>
                <p className='drag-date'>{exp.Date}</p>
                <img className='circle absolute bg-white z-50' src={exp.imageURL} onClick={()=>{experienceImageHandler({imageURL:exp.imageURL})}} />
                <div className='square'>
                  <p className='drag-text-body'><span className='underline drag-text-title'>{exp.Role}</span>{
                    exp.Description.split("|").map((line, index) => {
                      return <p key={index} className='drag-text'>• {line}</p>
                    }
                    )
                  }</p>

                  {/* pill */}
                  <div className='drag-pill-group'>
                    {exp.logos.map((logo, logo_index) =>
                      <div key={logo.Id} className='drag-pill z-50'>
                        <img className='pill-image' src={logo.imageURL} />
                        <p className='pill-text'>{logo.Id}</p>
                      </div>
                    )}
                  </div>



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