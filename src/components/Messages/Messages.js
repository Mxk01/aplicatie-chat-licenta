import React, { useContext} from 'react'
 
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { FaVideo} from "react-icons/fa";
import { ChatContext } from '../../context/ChatContext'

const Messages = () => {
    let { 
 
        adauga_emoji,
        sendMessage,
        setGroupMessage,
        groupMessage,
        showMessages,
        /* state variables */
          messagesBottom,
          sendGroupMessage,
          currentEmoji,
          setCurrentEmoji,
          emojiSelected,
          setEmojiSelected,
      navigate,
      
      groupMessages,
      socket,
      setSocket,
      user,
      setCurrentUser,
      checked,
      groupName,
      message,
      setMessage,
 
      } =  useContext(ChatContext)
  return (
    <div className="flex flex-col flex-auto h-full p-6 scroll-smooth md:h-full" style={{backgroundColor:'#9c88ff'}}>
    <div
      className={`flex flex-col flex-auto flex-shrink-0 rounded-2xl  ${checked ? 'bg-electro-magnetic' :'bg-white'} h-full p-4`}
    >
      <div className="flex flex-col h-full overflow-x-auto mb-4">

        <div className="flex flex-col h-full">
          <div className="grid grid-cols-12 gap-y-2">
            <span>{groupName}</span>
           {groupMessages.length!==0 &&  groupMessages.map( (message) =>  {
            // console.log(message)
                return( 
           <React.Fragment key={message._id}>  
           { 
          
                  message.messageGroup == groupName && message.isDirectMessage == false ?    
         <div className="col-start-1 col-end-8 p-3 rounded-lg">
           
              <div className="flex flex-row items-center">
                <div
                  className="relative ml-3 text-sm bg-gradient-to-r text-white w-60 max-h-20		break-words		 from-indigo-500 via-purple-500 to-pink-500 py-2 px-4 shadow rounded-xl"
                >
                  <p className='break-words	w-80	'>{message.contents}</p>
                  <span className=' text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:text-red-100 flex
                      p-4'>Posted  {`${message.createdAt.toLocaleString("ro-RO").slice(0,10)} ${message.createdAt.toLocaleString("ro-RO",{  timeZone: "Europe/Bucharest",hour12:false
                    }).slice(12,message.createdAt.toLocaleString().length-6)} by ${message.messageSender.username}`  } </span>
                                 
                </div>
              </div>
            </div>
           :'' }
      
             <div ref={messagesBottom} />

            </React.Fragment>
            
            )
            })} 

         
                        
                { emojiSelected &&  <Picker data={data} onEmojiSelect={adauga_emoji} style={{zIndex:100,position:'fixed'}}/> }

    
          </div>
        </div>
      </div>

      <div
        className={`flex flex-row items-center h-16 rounded-xl ${checked ? 'bg-dark' : 'bg-white'} w-full px-4`}
      >

        <div className='flex'>
        <FaVideo className='ml-2 mr-2 cursor-pointer'  size="1.3em" color="#a29bfe"/>
        
  

       
              <label htmlFor="upload">    

               <button
            className="flex items-center  	 justify-center text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
            </button>
            <input type="file" id="upload" style={{display:"none"}} />

            </label>
         
          
         
       
     
        </div>
        <div className="flex-grow ml-4">
          <div className="relative w-full">
          <textarea 
            value={groupMessage}
            onInput = { (e) => { 
              socket.emit('isTyping',{ user : user.username,message:` is typing ...  `})
            }}

            onChange={(e)=>{ 
              setGroupMessage(e.target.value); console.log(groupMessage)} }
           rows="1" className={`block mx-4 p-2.5 mr-2 w-full text-sm  bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  ${checked ? 'dark:bg-gray-800 dark:text-white' : 'text-gray-900 bg-white' }  dark:border-gray-600 dark:placeholder-gray-400   dark:focus:ring-blue-500 dark:focus:border-blue-500`} placeholder="Your message..."></textarea>

           
          <button
                            onClick={()=>setEmojiSelected(!emojiSelected)}

              className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
            
          </div>
        </div>
        <div className="ml-4">
          <button
            className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-2 ml-2 flex-shrink-0"
       onClick={(e)=>sendGroupMessage(e,groupName)}   >
            <span>Send</span>
            <span className="ml-2">
              <svg
                className="w-4 h-4 transform rotate-45 -mt-px"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Messages