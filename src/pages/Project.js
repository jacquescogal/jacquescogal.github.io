import React, { useEffect, useRef, useState } from 'react'
import MultilineTGS from '../components/MultilineTGS';
import Proj_logo from '../svg/Proj_logo';
import TGS from '../components/TGS';
import TGP from '../components/TGP';
import '../project.scss'
import styles from './Project.module.scss';
import {BiLinkExternal} from 'react-icons/bi';
import axios from 'axios';

const Project = ({setProjectRef,projectReveal,projectFade}) => {
    const onceRef=useRef(null);
    const projectRef=useRef(null);
    const [activeProject,setActiveProject]=useState(0);
    const [projectCards,setProjectCards]=useState([
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

    useEffect(() => {
      if (onceRef.current) return;
      onceRef.current = true;
      const fetchData = async () => {
  
        const reposResponse = await axios.get(process.env.REACT_APP_PROJECT_URL);
        const repos = JSON.parse(reposResponse.data.body).slice(0,5);
  
        setProjectCards(repos);
      };
  
      fetchData().catch(console.error);
    }, []);

  return (
    < >
    <div className='section-block project-block hide' ref={projectRef}>
    <p className='flex-none px-8 pt-4 text-left title-comp intro-load'>
    <span className='section-text text-4xl' >3.</span>
    <MultilineTGS toGenerateMap={["Projects"," (Latest created projects, fetched from github API)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    {projectCards.length===0 && <p className='flex-none px-8 pt-4 text-left title-comp intro-load text-white'>Fetching projects... (May have capped API limit, come again later)</p>}
    <div className={styles.CardDeck}>
      {projectCards.map((card,id)=>(
        <div className={`${styles.Card} ${activeProject===id && styles.Active}`} onMouseEnter={e=>{setActiveProject(id)}}>
          {/* <div className={styles.TitleJustify}> */}
          <a href={card.url_link} target="_blank" rel="noreferrer">
          <span className={styles.CardTitle}>{card.title}   <BiLinkExternal size={15}/></span>
          </a>

          <span className={styles.CardDate}>Created on: {new Date(card.created_at).toLocaleDateString()}</span>
          {/* </div> */}
          <span className={styles.CardDescription}>{card.description}</span>
        </div>
      ))}
    </div>
    </div>
    </>
  )
}

export default Project