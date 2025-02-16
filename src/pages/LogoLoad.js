import React,{useEffect, useRef,useState} from 'react'
import Logo from '../components/Logo';
import TGP from '../components/TGP';
import SGP from '../components/SGP';

const LogoLoad = ({setLogoLoaded}) => {
  const [logoText,setLogoText]=useState("__");
  const [phaseTwo,setPhaseTwo]=useState(false);

    document.body.style.overflow="hidden"
    
    const line_class="bg-green-200 ";

    useEffect(()=>{
      const timeout=setTimeout(()=>{
        document.body.style.overflow="auto"
        setLogoLoaded(true);
      },1500)
      return ()=>clearTimeout(timeout);
    },[])

    


    
  return (
    <>
    <div className='fixed h-full w-full bg-slate-950 z-30 noselect'>
      
<div className={(phaseTwo)?"container-second":"container"}>
        <div className="cube" onAnimationEnd={()=>{setLogoText("__acques Cogal");setPhaseTwo(true)}}>
          <div className="face top bg-black border-slate-950 border-2 text-green-200 overflow-hidden">
            <SGP toGenerate={"01110010111011001000110010111100110000011111110010110111110111100000000010110011"}  className={"text-6xl absolute top-0 w-max self-center align-center text-green-200 inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"01001001011101101010000110001000001110101111000000110010111111110011011000111011"}  className={"text-6xl absolute top-12 w-max self-center align-center text-green-200 inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"11011000100001101100101101001000010000011010010111001010000011001011001000110011"}  className={"text-6xl absolute top-24 w-max self-center align-center text-green-200 inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"11000101111100011110011111101010011110000001101010100011001110111010111011110001"}  className={"text-6xl absolute top-36 w-max self-center align-center text-green-200 inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
</div>
          <div className="face bottom"></div>
          <div className="face left bg-black border-slate-950 border-2 text-green-200 overflow-hidden" >
          <SGP toGenerate={"010101011010110101011100110010101011010110101011100110010101011010110101011100110"}  className={"text-6xl absolute top-0 w-max self-center align-center text-green-200  inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"11011111011010001010000000110000001000010101000100000110000011001100101000101010"}  className={"text-6xl absolute top-12 w-max self-center align-center text-green-200  inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"11010010000001000001101011010010011101101110101010010000101101001110100110101011"}  className={"text-6xl absolute top-24 w-max self-center align-center text-green-200  inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            <SGP toGenerate={"10110011100011000001101001110101001000010001100111011011000000001010010100010101"}  className={"text-6xl absolute top-36 w-max self-center align-center text-green-200  inset-x-0 ms-auto flow-root w-max "} speed={100} start={10}/>
            </div>
          <div className="face right"></div>

          <div className="face front bg-green-200 border-green-200 border-2">
          <TGP  toGenerate={">J"} className={"text-slate-950  w-max align-center self-center absolute tracking-widest"}
style = { {
  transform: `translate(${5}px, ${-20 }px)` 
}}
      quickLeave={false} speed={5} preoccupy={false}/>
      <TGP  toGenerate={logoText} className={"text-green-200  w-max align-center self-center absolute tracking-widest"}
style = { {
  transform: `translate(${5}px, ${-20 }px)` 
}}
      quickLeave={false} speed={4} preoccupy={false}/>
          </div>
          <div className="face back"></div>
        </div>
      </div>



    </div>

    

    
    
</>
  )
}

export default LogoLoad