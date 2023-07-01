import React from 'react'
import TGP from './TGP'
const Logo = () => {
  return (
    <div className="container-small noselect cursor-pointer">
    <div className="cube">
    <div className="face front bg-green-200 border-green-200 border-2">
          <TGP  initialText={">J"} className={"text-slate-950  w-max align-center self-center absolute tracking-widest"}
style = { {
  transform: `translate(${5}px, ${-20 }px)` 
}}
      quickLeave={false} speed={5} preoccupy={false}/>
      <TGP  initialText={"__acques Cogal"} className={"text-green-200  w-max align-center self-center absolute tracking-widest"}
style = { {
  transform: `translate(${5}px, ${-20 }px)` 
}}
      quickLeave={false} speed={4} preoccupy={false}/>
          </div>
    </div>
    </div>
  )
}

export default Logo