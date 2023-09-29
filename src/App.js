import logo from './logo.svg';
import './App.css';
import Homepage from './pages/Homepage';
import { Route,Routes } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import {React,useEffect,useState,useRef} from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const extractLinks=(texts)=>{
  let links=[]
  console.log(texts)
  texts.forEach(text=>{
  switch(text){
    case "contact":
      links.push({type:"internal",text:"Contact me",where:"contact"})
      break;
    case "linkedin":
      links.push({type:"external",text:"LinkedIn",where:"https://www.linkedin.com/in/j-cogal/"})
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

const linkTextParser=(text)=>{

  const pattern = /%%(.*?)%%/g;

  const matches = text.match(pattern);
  const texts = matches ? matches.map(match => match.slice(2, -2)) : [];
  const modifiedPassage = text.replace(pattern, '');


  return {
    links:extractLinks(texts),
    message:modifiedPassage
  }
}

function App() {
  const [uuid,setUuid]=useState(null);
  const [isThinking,setIsThinking] = useState(false);
  const [chatBoxActive, setChatBoxActive] = useState(false);
  const [chatInputText, setChatInputText] = useState("");
  const [chatContext, setChatContext] = useState("none");
  const prepareText = (chatContext, resource) => {
    // setChatResource(resource);
    // setChatInputText("");
    // setChatBoxActive(true);
    // setChatContext(chatContext);
    // setChatHistory(chatHistory=>[...chatHistory,{type:"system",message:`Switch to context ${chatContext}`}])
  }
  const [writeLast,setWriteLast]=useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      type: "ai",
      message: "Hello, I'm Jacques! Nice to meet you!",
      links:[]
    }
  ]);

  useEffect(()=>{
    if (uuid===null){
      setUuid(uuidv4())
    }
  },[])

  const handleSubmit=()=>{
    if (isThinking===true) return;
    if (chatInputText==="") return;
    // setWriteLast(true);
    deliver(chatInputText);
    setChatInputText("");
  }

  // const deliverTest=async(text)=>{
  //   setIsThinking(true);
  //   setChatHistory([...chatHistory,{type:"user",message:chatInputText}]);
  //   setTimeout(()=>{
  //     let ai_chat_bubble={
  //       ...linkTextParser("hello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello therehello there"),
  //       type:"ai"
  //     }
  //     setWriteLast(true)
  //     setChatHistory(chatHistory=>[...chatHistory,ai_chat_bubble])
  //     setIsThinking(false)
  //   },5000)
  // }

  const deliver=async(text)=>{
    setIsThinking(true);
    const temp_history=[]
    for (let i=chatHistory.length-1;i>=0;i--){
      if (chatHistory[i].type==="system") continue;
      else temp_history.push({entity:chatHistory[i].type,message:chatHistory[i].message});
      if (temp_history.length>=4) break;
    }
    setChatHistory([...chatHistory,{type:"user",message:chatInputText}]);
    temp_history.reverse();
    const data={
      uuid:uuid,
      user_message:text,
      chat_history:temp_history
    }
    try{
      const response=await axios.post("https://portfolio.flashcardai.app/chat",data);
      console.log('Successfully posted data:', response.data);
      let ai_chat_bubble={
        ...linkTextParser(response.data.ai_message),
        type:"ai"
      }
      setWriteLast(true)
      setChatHistory(chatHistory=>[...chatHistory,ai_chat_bubble])
    } catch (error) {
        console.error('Error posting data:', error);
        
        if (error.response?.status===429){
          setChatHistory(chatHistory=>[...chatHistory,{type:"system",message:`error: ${"Too many requests (5 per minute max), please wait a few seconds before trying again."}`,links:[]}])
        }
        else{
          setChatHistory(chatHistory=>[...chatHistory,{type:"system",message:`error: ${error}`,links:[]}])
        }
    }
    finally{
      setIsThinking(false);
    }
    }
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, []);

  

  return (
    <div className="App">
      <ToastContainer/>
      <Routes>
            <Route path='/' element={<Homepage setWriteLast={setWriteLast} writeLast={writeLast} setChatBoxActive={setChatBoxActive} isThinking={isThinking} handleSubmit={handleSubmit} prepareText={prepareText} chatHistory={chatHistory} setChatHistory={setChatHistory} chatContext={chatContext} setChatContext={setChatContext} chatBoxActive={chatBoxActive} chatInputText={chatInputText} setChatInputText={setChatInputText}/>}>
            </Route>
            <Route path="*" element={<p>There's nothing here: 404!</p>} />
        </Routes>
    </div>
  );
}

export default App;
