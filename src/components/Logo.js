import React from 'react'
import TGP from './TGP'
const Logo = ({onClick}) => {
  return (
    <div className="container-small noselect cursor-pointer" onClick={onClick}>
    <div className="cube">
    <div className="face front  border-2">
          <TGP  initialText={">J"} className={"face-text  w-max align-center self-center absolute tracking-widest"}
style = { {
  transform: `translate(${5}px, ${-20 }px)` 
}}
      quickLeave={false} speed={5} preoccupy={false}/>
      <TGP  initialText={"__acques Cogal"}  toGenerate={"__acques Cogal"} className={"face-overflow  w-max align-center self-center absolute tracking-widest"}
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