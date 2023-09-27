import React, { useState } from 'react'
import AiMascot from './ai_mascot_only.png'
import style from './AiLogo.module.scss'



const AiLogo = (props) => {
  const [dragging, setDragging] = useState(false);
  const handleDragStart = (e) => {
    const timer = setTimeout(() => {
      props.prepareText("none", "");
      setDragging(true);
    }, 1);
    e.dataTransfer.effectAllowed = "move";
  };

  // This will inform the draggable item about the drop target
  const handleDragEnd = (e) => {
    setDragging(false);
    if (e.dataTransfer.dropEffect === "move") {
      const target = e.dataTransfer.getData('target');
    }
  };

  const handleMouseLeave = () => {
    // setDragging(true);
  }


  return (
    <div className={`${props.className} ${style.AiDraggable}`} onAnimationEnd={props.onAnimationEnd} onMouseLeave={handleMouseLeave} >
      {dragging && <div className={props.backgroundColor === "primary" ? style.HiderPrimary : style.HiderSecondary} />}
      
      <img draggable={false} onDragStart={handleDragStart} onDragEnd={handleDragEnd} src={AiMascot} className={style.AiLogo} />

    </div>
  )
}

export default AiLogo