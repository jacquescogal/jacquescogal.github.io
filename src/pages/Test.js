import React from 'react'
import '../Carousell.css'
import { useEffect } from 'react';
const Test = () => {
  const options = document.querySelectorAll('.option');

  // const handleIntersectionObserver = ()=>{
  //   let options = {
  //     root: document.getElementById("option-scroll"),
  //     rootMargin: '0px',
  //     threshold: 1.0
  //   }
  //   //Target define
  //   const targets = document.getElementById("option-scroll").querySelectorAll(".option")
  //   console.log(document.querySelectorAll(".option"))
  //   //Define observer
  //   const activeHeader = (target)=>{
  //     const headerObserver = new IntersectionObserver((entries,observer)=>{
  //       entries.forEach(entry=>{
  //         console.log(entry);
  //       })
  //     },options)
  //     headerObserver.observe(target)
  //   }

  //   //Loop through targets
  //   targets.forEach(activeHeader)
  // }

  // useEffect(()=>{
  //   handleIntersectionObserver();
  // })


  
  const handleClick=(e)=>{
    Array.from(document.querySelectorAll('.option')).forEach(
      (el) => el.classList.remove('active')
    );
    e.target.classList.add("active");
  }
  return (
    <>
    <div className="holder ">
        <div id={"option-scroll"} className="options snap-x snap-mandatory">
          <div className="option active snap-center " onClick={(e)=>{handleClick(e)}} style={{backgroundImage: `url(https://66.media.tumblr.com/6fb397d822f4f9f4596dff2085b18f2e/tumblr_nzsvb4p6xS1qho82wo1_1280.jpg)`} }>
            <div className="label">
              <div className="icon">
                <i className="fas fa-walking" />
              </div>
              <div className="info">
                <div className="main">Blonkisoaz</div>
                <div className="sub">Omuke trughte a otufta</div>
              </div>
            </div>
          </div>
          <div className="option snap-center " onClick={(e)=>{handleClick(e)}} style={{optionbackground: 'url(https://66.media.tumblr.com/8b69cdde47aa952e4176b4200052abf4/tumblr_o51p7mFFF21qho82wo1_1280.jpg)'}}>
            <div className="label">
              <div className="icon">
                <i className="fas fa-snowflake" />
              </div>
              <div className="info">
                <div className="main">Oretemauw</div>
                <div className="sub">Omuke trughte a otufta</div>
              </div>
            </div>
          </div>
          <div className="option snap-center " onClick={(e)=>{handleClick(e)}} style={{optionbackground: 'url(https://66.media.tumblr.com/5af3f8303456e376ceda1517553ba786/tumblr_o4986gakjh1qho82wo1_1280.jpg)'}}>
            <div className="label">
              <div className="icon">
                <i className="fas fa-tree" />
              </div>
              <div className="info">
                <div className="main">Iteresuselle</div>
                <div className="sub">Omuke trughte a otufta</div>
              </div>
            </div>
          </div>
          <div className="option snap-center " onClick={(e)=>{handleClick(e)}} style={{optionbackground: 'url(https://66.media.tumblr.com/5516a22e0cdacaa85311ec3f8fd1e9ef/tumblr_o45jwvdsL11qho82wo1_1280.jpg)'}}>
            <div className="label">
              <div className="icon">
                <i className="fas fa-tint" />
              </div>
              <div className="info">
                <div className="main">Idiefe</div>
                <div className="sub">Omuke trughte a otufta</div>
              </div>
            </div>
          </div>
          <div className="option snap-center " onClick={(e)=>{handleClick(e)}} style={{optionbackground: 'url(https://66.media.tumblr.com/f19901f50b79604839ca761cd6d74748/tumblr_o65rohhkQL1qho82wo1_1280.jpg)'}}>
            <div className="label">
              <div className="icon">
                <i className="fas fa-sun" />
              </div>
              <div className="info">
                <div className="main">Inatethi</div>
                <div className="sub">Omuke trughte a otufta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
  )
}

export default Test