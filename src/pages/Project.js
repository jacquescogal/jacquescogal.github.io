import React, { useEffect, useRef, useState } from 'react'
import MultilineTGS from '../components/MultilineTGS';
import Proj_logo from '../svg/Proj_logo';
import TGS from '../components/TGS';
import TGP from '../components/TGP';
import '../project.scss'
import styles from './Project.module.scss';

const Project = ({setProjectRef,projectReveal,projectFade}) => {
    const projectRef=useRef(null);
    const [projectCards,setProjectCards]=useState([
      {title:"FlashcardAi",
    link:"https://www.flashcardai.app",
    description:"A flashcard app that uses AI to help you learn better.",
  tech:["React","Python","Flask","AWS"]},
  {title:"Likewise",
    link:"https://www.github.com/jacquescogal/likewise-app-react-firebase",
    description:"Developed a web-app for tertiary students to get together through common interests.",
  tech:["React","Firebase","Node.js"]},
  {title:"Fitrition",
    link:"https://www.github.com/jacquescogal/CZ2006-Software-Engineering-Fitrition",
    description:"Developed a fitness and nutrition app with a social aspect to encourage healthy living among Singaporeans.",
  tech:["Java","Firebase","Android Studio"]},
    ]);
    useEffect(()=>{
        setProjectRef(projectRef);
    },[projectRef])

    const blockSelect = document.querySelector('.section-block.project-block');

    useEffect(()=>{
      if (projectReveal){
        blockSelect?.classList.remove('hide')
        blockSelect?.classList.add('show')
      }
    },[projectReveal])

    useEffect(() => {
      if (projectFade) {
        blockSelect?.classList.add('fade')
      }
      else{
        blockSelect?.classList.remove('fade')
      }
    }, [projectFade])

  return (
    < >
    <div className='section-block project-block hide' ref={projectRef}>
    <p className='flex-none px-8 pt-4 text-left title-comp intro-load'>
    <span className='section-text text-4xl' >3.</span>
    <MultilineTGS toGenerateMap={["Projects"," (Flashcardai is up!)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    <div className={styles.CardDeck}>
      {projectCards.map((card)=>(
        <div className={styles.Card}>
          <a href={card.link} target="_blank" rel="noreferrer">
          <span className={styles.CardTitle}>{card.title}</span>
          </a>
          <span className={styles.CardDescription}>{card.description}</span>
        </div>
      ))}
    </div>
    </div>
    </>
  )
}

export default Project