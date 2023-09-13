import React, { useEffect, useRef, useState } from 'react'
// import myImage from 
import TGP from '../components/TGP';
import introStyle from '../intro.module.css'
import MouseSVG from '../svg/Mouse'
import ScrollMouse from '../svg/ScrollMouse';
import resumePDF from '../resume_Jacques.pdf'
import MultilineTGS from '../components/MultilineTGS';

const Intro = ({setIntroRef,contactRef,profileFade}) => {
  const playImage=require('../board-game.png')
  const myImage=require('../Jacques_bg.png')
  const cropImage=require('../Jacques_only_alt.png')
  const bookImage=require('../book.png')
  const goalImage=require('../mountain.png')
  const [helloFade,setHelloFade]=useState(true);
  const [helloText,setHelloText]=useState("");
  const [helloSentinal,setHelloSentinal]=useState(0);
  const [blink,setBlink]=useState(true);
  const [show_,setshow_]=useState(true);
  const helloString="Hello, you";
  const [greetings,setGreetings]=useState([
  ]);
  const [greetingsSentinal,setGreetingsSentinal]=useState(0);
  const imageRef=useRef(null);
  const introRef=useRef(null);
  const [inImage,setInImage]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [transitChange,setTransitChange]=useState(false);
  const [imageCaption,setImageCaption]=useState("Hi, I'm Jacques!")
  const [navHover,setNavHover]=useState(0);
  const [isTouchScreen,setIsTouchScreen]=useState(false);
  const [touchOpen,setTouchOpen]=useState(false);

  const [textType,settextType]=useState(0);

  useEffect(()=>{
    setIntroRef(introRef);
  },[introRef])

  useEffect(()=>{
    const timeout=setTimeout(()=>{setHelloFade(true)},500);
    return ()=>clearTimeout(timeout);
  })

  useEffect(()=>{
    if (helloSentinal==helloString.length){
      setBlink(true);
      return;
    }
    setBlink(false)
    const timeout=setTimeout(()=>{setHelloText(helloText.concat(helloString[helloSentinal]));setHelloSentinal(helloSentinal+1);},50);
    return ()=>clearTimeout(timeout);
  },[helloText])

  useEffect(()=>{
    const timeout=setTimeout(()=>{setshow_(!show_)},500);
    return ()=>clearTimeout(timeout);
  })


  // Dialogue timing
  const imageClickHandler=(e)=>{
    setGreetingsSentinal(greetingsSentinal+1);
    setGreetings(greetings.concat({key:greetingsSentinal,x:e.clientX-imageRef.current?.getBoundingClientRect().left-50,
      y:e.clientY-imageRef.current?.getBoundingClientRect().top,
      text:"Hello!"}))
    setToDelete(toDelete.concat(greetingsSentinal))
  }

  const [toDelete,setToDelete]=useState([])

  useEffect(()=>{
    if (greetings.length>0){
    const timeout=setTimeout(()=>{if(toDelete[0]===greetings[0].key) setGreetings(greetings.slice(1));setToDelete(toDelete.slice(1));},1000)
    return ()=>clearTimeout(timeout)
    }
  },[greetings])

  // Mouse Track
  const [mousePos, setMousePos] = useState({});

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
  }, []);

  const handleExitImage=()=>{
    setInImage(false)
    setTransitChange(false)
  }

  useEffect(()=>{
    if (inImage) {
      const timeout=setTimeout(()=>{if (inImage) setTransitChange(true)},150);
    return ()=>clearTimeout(timeout);
  }
  },[inImage])

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isTouchScreen){
      const container = imageRef.current;
      const containerRect = container.getBoundingClientRect();
      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;
      const maxSkew = 5; // Maximum skew angle in degrees

      const angleX = (mouseY - centerY) / centerY * maxSkew;
      const angleY = (mouseX - centerX) / centerX * maxSkew;



      container.style.transform = `perspective(1000px) rotateX(${-angleX}deg) rotateY(${angleY}deg)`;
    }
    else{
      container.removeEventListener('mousemove', handleMouseMove);
    }
    };

    const container = imageRef.current;
    if (!isTouchScreen)container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isTouchScreen]);

  const getResume = () => {
    // using Java Script method to get PDF file
    fetch(resumePDF).then(response => {
        response.blob().then(blob => {
            // Creating new object of PDF file
            const fileURL = window.URL.createObjectURL(blob);
            // Setting various property values
            let alink = document.createElement('a');
            alink.href = fileURL;
            alink.download ='Resume_CogalJacques.pdf';
            alink.click();
        })
    })
}
const blockSelect = document.querySelector('.section-block.profile-block');

useEffect(() => {
  console.log(profileFade)
  if (profileFade) {
    blockSelect?.classList.add('fade')
  }
  else{
    blockSelect?.classList.remove('fade')
  }
}, [profileFade])

  return (
    <div ref={introRef} className='section-block profile-block'>
    
    <p className='flex-none px-8 pt-4 text-left title-comp intro-load'>
    <span className='section-text text-4xl'>1.</span>
    <MultilineTGS toGenerateMap={["Profile"," (Hello there!)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    <div className='flex justify-center sectionLoad' onAnimationEnd={()=>{setLoaded(true)}} onTouchStart={()=>{console.log("touched");setIsTouchScreen(true);imageRef.current.style.transform = `perspective(1000px) rotateX(${0}deg) rotateY(${0}deg)`}}>
    {/* <div className='ping-holder'>
    <div className='ping'></div>
    </div> */}
    <div>    
      <p  className='hidden'>Intro</p>
      
    <div className='image-text-holder px-10'>
      
      
      {/* Image */}
      
    <div className='flex flex-col imageLoad' onTouchStart={()=>{setTouchOpen(true)}}>
      <div className='image-size flex static' onMouseMove={()=>{if(loaded)setInImage(true);}} onMouseLeave={()=>{handleExitImage();imageRef.current.style.transform = `perspective(1000px) rotateX(${0}deg) rotateY(${0}deg)`}}>
    <div ref={imageRef} className="image-size static cursor-pointer blur-none overflow-hidden group rounded-lg"   >
    <img  className={"image-size absolute transition duration-500 ease-in-out transform -z-20 scale-100 group-hover:scale-110 "  +((transitChange)?'':introStyle['img-hover'])} src={cropImage} alt="image description"
    style={(inImage && !isTouchScreen)?{top: `${Math.floor(((imageRef.current?.offsetTop+Math.floor(imageRef.current?.clientHeight/2))-mousePos.y)/16)}px`, 
    left: `${Math.floor(((imageRef.current?.offsetLeft+Math.floor(imageRef.current?.clientWidth/2))-mousePos.x)/16)}px`}:{top:'0px',left:'0px'}} 
    onMouseDown={(e)=>{imageClickHandler(e)}}/>
    <img  className={"image-size absolute transition transform duration-500 ease-in-out  -z-50 scale-110 group-hover:blur-sm "  +((transitChange)?'':introStyle['img-hover'])}
    src={myImage} alt="image description" 
    style={(inImage && !isTouchScreen)?{top: `${Math.floor(((imageRef.current?.offsetTop+Math.floor(imageRef.current?.clientHeight/2))-mousePos.y)/8)}px`, 
    left: `${Math.floor(((imageRef.current?.offsetLeft+Math.floor(imageRef.current?.clientWidth/2))-mousePos.x)/8)}px`}:{top:'0px',left:'0px'}} 
    onMouseDown={(e)=>{imageClickHandler(e)}}/>


    {/* Click icons */}

    {/* Journey button */}
    {/* <div  className={'image-buttons-sizer transition ease-in-out duration-500 absolute rounded-full bg-green-300 '+((!isTouchScreen || !touchOpen)?' scale-0 group-hover:scale-100  ':"")+((transitChange)?' -z-10':introStyle['img-hover']+' -z-30 ')}
    style={
      (inImage || (isTouchScreen && touchOpen))?{top:`${0*Math.floor(imageRef.current?.clientHeight/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetTop+Math.floor(imageRef.current?.clientHeight/2))-mousePos.y)/8))}px`, 
    left:`${9*Math.floor(imageRef.current?.clientWidth/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetLeft+Math.floor(imageRef.current?.clientWidth/2))-mousePos.x)/8))}px`}:
    {top:`${2*Math.floor(imageRef.current?.clientHeight/5)}px`,left:`${2*Math.floor(imageRef.current?.clientWidth/5)}px`}

  
  } 
    >
    <img  className={"object-contain "}  src={bookImage} onMouseEnter={()=>setImageCaption("Journey so far")}
    onMouseLeave={()=>setImageCaption("Try hovering over me")} onTouchStart={()=>setImageCaption("Journey so far")}/>
    </div> */}


    {/* Goal button */}
    {/* <div  className={'image-buttons-sizer transition ease-in-out duration-500 absolute rounded-full bg-blue-300 '+((!isTouchScreen || !touchOpen)?' scale-0 group-hover:scale-100  ':"")+((transitChange)?' -z-10':introStyle['img-hover']+' -z-30 ')}
    style={
      (inImage || (isTouchScreen && touchOpen))?{top:`${2*Math.floor(imageRef.current?.clientHeight/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetTop+Math.floor(imageRef.current?.clientHeight/2)))-mousePos.y)/8)}px`, 
    left:`${14*Math.floor(imageRef.current?.clientWidth/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetLeft+Math.floor(imageRef.current?.clientWidth/2))-mousePos.x)/8))}px`}:
    {top:`${2*Math.floor(imageRef.current?.clientHeight/5)}px`,left:`${2*Math.floor(imageRef.current?.clientWidth/5)}px`}}
    >
    <img  className={"object-contain"}src={goalImage} onMouseEnter={()=>setImageCaption("Ambitions")}
    onMouseLeave={()=>setImageCaption("Try hovering over me")} onTouchStart={()=>setImageCaption("Ambitions")}/>
    </div> */}
    
    {/* Hobby button */}
    {/* <div  className={'image-buttons-sizer transition ease-in-out duration-500 absolute rounded-full bg-yellow-300 '+((!isTouchScreen || !touchOpen)?' scale-0 group-hover:scale-100  ':"")+((transitChange)?' -z-10':introStyle['img-hover']+' -z-30 ')}
    style={(inImage || (isTouchScreen && touchOpen))?{top:`${7*Math.floor(imageRef.current?.clientHeight/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetTop+Math.floor(imageRef.current?.clientHeight/2))-mousePos.y)/8))}px`, 
    left:`${15*Math.floor(imageRef.current?.clientWidth/20)+((isTouchScreen)?0:Math.floor(((imageRef.current?.offsetLeft+Math.floor(imageRef.current?.clientWidth/2))-mousePos.x)/8))}px`}:
    {top:`${2*Math.floor(imageRef.current?.clientHeight/5)}px`,left:`${2*Math.floor(imageRef.current?.clientWidth/5)}px`}}
    >
    <img  className={"object-contain"}src={playImage} onMouseEnter={()=>setImageCaption("What I enjoy outside of code")}
    onMouseLeave={()=>setImageCaption("Try hovering over me")} onTouchStart={()=>setImageCaption("What I enjoy outside of code")}/>
    </div> */}
    {/* Spawn greetings */}
  {
      greetings.map((mi)=>
      <div key={mi.key} className={'absolute w-[100px] h-[40px] self-center content-center bg-white border-black border-2 rounded-lg cursor-default scale-0 '+introStyle['dialogue-box']} 
      style={{top: `${mi.y}px`, left: `${mi.x}px`}}
      >
          <p className={introStyle['dialogue']}  > {mi.text}</p>
      </div>
  )
    }
    </div>
    </div>
    <div className='flex flex-row'>
    <TGP toGenerate={"//"+imageCaption} className='text-left intro-text-green-dark-200 opacity-100' speed={1} randomChoice={1} quickLeave={false}/> <span className={"transition ease-out duration-200 relative flex h-3 w-3 mx-1 "+((navHover===1)?"opacity-100":"opacity-0")} >
  <span className="animate-ping absolute inline-flex inset-y-1/2 h-full w-full rounded-full bg-green-300 opacity-75"></span>
  <span className="relative inline-flex inset-y-1/2 rounded-full h-3 w-3 bg-green-400"></span>
</span>
</div>
    </div>

    
      
      
      {/* Text */}
      <div  className="px-10 py-10 w-100 flex-none">
        <div className={introStyle.IntroHolder}>
        
        {textType===0 && 
        <>
        <TGP toGenerate="Hello there, my name is" className={"text-left intro-text-green-dark-200 text-xl "} speed={1}/>
        <TGP toGenerate={"Jacques Cogal"} className={"text-left intro-text-white-dark text-8xl"}/>
        <TGP toGenerate={"|Aspiring Full-stack Developer|"} className={"text-left intro-text-green-dark-100 text-4xl"} speed={1}/>
        <TGP toGenerate={"I enjoy building things from ones and zeros. Thanks for stopping by!"} className={"text-left intro-text-green-dark-200 text-xl mt-5"} speed={1}/>
        <div className='flex flex-row content-center items-center'>
        <button className='skip-button' onClick={()=>{getResume()}}>Resume</button>
        <button className='skip-button' onClick={()=>window.scrollTo({top: contactRef.current.offsetTop, behavior: 'smooth'})}>Contact Me</button>
        </div>
        </>}
        </div>

      </div>

    </div>
    </div>

    </div>
    </div>
  )
}

export default Intro