import { useEffect, useRef, useState } from "react"
import ChatbotIcon from "./components/ChatbotIcon"
import ChatForm from "./components/ChatForm"
import ChatMessage from "./components/ChatMessage"


const App = () => {
  const [chatHistory,setChatHistory]=useState([])
  const [showChat,setShowChat]=useState([false])
  const chatBotRef=useRef()
  const generateBotResponse=async (history)=>{
    //Helper function to update chat history
    const updateHistory=(text,isError=false)=>{
      setChatHistory((prev)=>[...prev.filter((msg)=>msg.text!=="Thinking..."),{role:"model",text,isError}])
    }
    //format chat history for API request
    history=history.map(({role,text})=>({role,parts:[{text}]}))
   const requestOptions={
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents: history})
   }
   try{
    //make api call to get the bot's response
    const response =await fetch(import.meta.env.VITE_API_URL,requestOptions)
    const data=await response.json()
    if(!response.ok) throw new Error(data.error.message || "something went wrong!")
    //Clean and update chat history with bot's response
    const apiResponseText=data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
    updateHistory(apiResponseText);
    }catch(error){
      updateHistory(error.message,true)
   }
  }
  useEffect(()=>{
  //Auto-scroll whenever chat history updates
  chatBotRef.current.scrollTo({top:chatBotRef.current.scrollHeight,behavior:"smooth"})
  },[chatHistory])
  return (
    <div className="container">
      
      <div className="chatbot-popup">
        {/* chatbox header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon/>
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>
        {/* chatbox body */}
        <div  ref={chatBotRef} className="chat-body">
          <div className="message bot-message">
             <ChatbotIcon/>
             <p className="message-text">Hey there! 👋 <br/> How can I help you today?</p>
          </div>
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat,index)=>(<ChatMessage key={index} chat={chat}/>))}
          
        </div>
        {/* chatbox-footer */}
        <div className="chat-footer">
         <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse}/>
        </div>
      </div>
    </div>
  )
}

export default App