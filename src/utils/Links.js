import { ChatLink } from "../types/Chatbot.ss"


const extractLinks = (texts)=>{
    const links=[]
    texts.forEach(text=>{
    switch(text){
      case "contact":
        links.push({type:"internal",text:"Contact me",where:"contact"})
        break;
      case "linkedin":
        links.push({type:"external",text:"LinkedIn",where:"https://www.linkedin.com/in/j-cogal/"})
        break;
      case "github":
        links.push({type:"external",text:"GitHub",where:"https://github.com/jacquescogal"})
        break;
      case "leetcode":
        links.push({type:"external",text:"LeetCode",where:"https://leetcode.com/jacquescogal/"})
        break;
      case "project":
        links.push({type:"internal",text:"Projects",where:"projects"})
        break;
      case "experience":
        links.push({type:"internal",text:"Experience",where:"experiences"})
        break;
      case "resume":
        links.push({type:"internal",text:"Resume",where:"resume"})
        break;
    }})
    return links;
  }

  export const linkToText = (link)=>{
    return ` ${link.map(l => `%%${l.text}%%`).join(' ')}`
  }
  
  export const linkTextParser = (text) => {
  
    const pattern = /%%(.*?)%%/g;
  
    const matches = text.match(pattern);
    const texts = matches ? matches.map(match => match.slice(2, -2)) : [];
    const modifiedPassage = text.replace(pattern, '');
    const links = extractLinks(texts);
    console.log(links)
    return {
      links: links,
      message: modifiedPassage
    }
  }