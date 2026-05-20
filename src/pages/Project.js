import React, { useEffect, useRef, useState } from 'react'
import MultilineTGS from '../components/MultilineTGS';
import '../project.scss'
import axios from 'axios';
import Article from '../components/Article';
import { useDispatch } from 'react-redux';
import { setShowModal } from '../store/modalStateSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Project = ({setProjectRef,projectReveal,projectFade}) => {
    const onceRef=useRef(null);
    const projectRef=useRef(null);
    const dispatch = useDispatch();
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
  
        const reposResponse = await axios.get(import.meta.env.VITE_PROJECT_URL);
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
    <MultilineTGS toGenerateMap={["Projects"," (github API)"]} classNameMap={["number-text","flair-text"]}/>
    </p>
    {projectCards.length===0 && <p className='flex-none px-8 pt-4 text-left title-comp intro-load text-white'>Fetching projects... (May have capped API limit, come again later)</p>}
    <Card className="mx-auto max-w-3xl border-primary-text/30 bg-slate-950/80 text-primary-text">
      <CardContent className="flex flex-col items-start gap-4 p-6">
      <Button type="button" variant="outline" className='text-primary-text' onClick={()=>{dispatch(setShowModal(true))}}>Constructing</Button>
      <Article/>
      </CardContent>
    </Card>
    </div>
    </>
  )
}

export default Project
