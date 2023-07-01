import React from 'react'
import '../sidelinks.css';
import Linkedin_logo from '../svg/Linkedin_logo';

const SideLinks = () => {
  return (
    <>    
    <div className='sl-line'>
        <div className='sl-logo-hold'>
            <Linkedin_logo className={"logo"}/>
            <Linkedin_logo className={"logo"}/>
            <Linkedin_logo className={"logo"}/>
            <Linkedin_logo className={"logo"}/>

            {/* <Linkedin_logo className={"fill-green-800 logo"}/> */}
        </div>
    </div>
    
    </>
  )
}

export default SideLinks