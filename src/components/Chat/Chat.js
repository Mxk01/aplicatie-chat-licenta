import React, {useEffect, useState,useRef} from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import {io} from 'socket.io-client'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'


function Chat() {
  const messagesBottom = useRef(null);

  let [currentEmoji,setCurrentEmoji] = useState({})
  let [emojiSelected,setEmojiSelected] = useState(false)
  let [socket,setSocket]  = useState(null)
  let [currentUsers,setCurrentUsers] = useState([]);
  let [directMessages,setDirectMessages] = useState([]);
  let [userToDM,setUserToDM] = useState({});
  let [user,setCurrentUser]  = useState(JSON.parse(localStorage.getItem('user')));
  let config = { headers : {'Authorization' : `Bearer ${JSON.parse(localStorage.getItem('user')).data.token}` }}
  let navigate = useNavigate()
  let [checked,setChecked] = useState(false);
  let [message,setMessage] = useState('')
  let [isDirectMessage,setIsDirectMessage] = useState(false);
  let [messages,setMessages] = useState([]);
  let [currentUserId,setCurrentUserId] = useState(''); 
  let [mSender,setMsender]= useState('');
  let [mReceiver,setMReceiver] = useState('')

  useEffect(() => {
    setSocket(io("http://localhost:5000"));
  }, []);

   useEffect(()=>{
    console.log()
    socket?.emit("utilizator-nou-online",user.data.username)
   },[socket,user])

   
 
  

  useEffect(() => {
    messagesBottom.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  useEffect(()=>{
 
     let getCurrentUsers = async () => {
     let users = await axios.get('/api/user/users-list',config);
     setCurrentUsers(users.data.message)
    }
    if(JSON.parse(localStorage.getItem('user')).data.token){
    getCurrentUsers();
    
    }
     },[user])
  
     useEffect(()=>{
      let showMessages = async () => {
      if(isDirectMessage && userToDM) {
        let sender = await axios.get('/api/user/get-current-user',config); 
        setCurrentUserId(sender.data.currentUser._id);
 
      // swap the ids
      let directChatMessages = await axios.get(`/api/user/direct-messages/${sender.data.currentUser._id}/${userToDM._id}`,config);
    
      setMessages(directChatMessages.data.messages)
      
     
    } }
      showMessages();
    },[messages,userToDM])

    useEffect(()=>{
    //   socket?.on("obtineNotificare",(({receiverName,mesaj})=> { 
    //     alert(mesaj); 
    //  }))
  
       // socket este nullabil pentru ca initial este setat in state ca null ,daca exista socket evenimentul poate fi emis
      socket?.on('receive-message',async({message})=>{
        if(message.contents && message.receiverId == userToDM._id){
        setMessages([...messages,message.contents]);
        }
      })
      
    },[socket])
        let sendMessage = async(e) => {
          e.preventDefault();
 
  // console.log("Sender ID " + sender.data.currentUser._id);
  // console.log("Receiver ID " + userToDM._id);
        let sender = await axios.get('/api/user/get-current-user',config);
       
        if(userToDM && isDirectMessage){
          
          let messageOptions = {isDirectMessage:true,contents:message,photoPath:''};
          // making the room for both sender and receiver
          socket?.emit('send-message',{
            message : {...messageOptions},  
            senderName : user.username, 
            receiverName: userToDM.username
          });

          
        


          let directMessage = await axios.post(`/api/user/add-message/${sender.data.currentUser._id}/${userToDM._id}`
          ,messageOptions);
          
          setMessage('')

          
        }
        else { 
          // do some conditional so it shows empty screen instead of conversation with x,y,z
        }
         
    }
  return (
    <div className={`flex h-screen antialiased ${checked ? 'text-gray-light' : 'text-gray-800'} `}>
    <div className="flex flex-row h-full w-full overflow-x-hidden">
      {/* <button onClick = { () => {
        console.log(`Sender name : ${user.data.username}`)
        console.log(`Receiver name : ${userToDM.username}`)

        //  vom cauta receiver-ul  folosind numele cu functia getUser si vom emite un eveniment catre acesta
        socket?.emit("trimiteNotificare",{
          senderName : user.username, 
          receiverName: userToDM.username, // OK 
          mesaj:"Test123232"
        })
      }}>Testing notifs</button> */}
      <div className={`flex flex-col py-8 pl-6 pr-4 w-64 ${checked ? 'bg-electro-magnetic' :'bg-white'} flex-shrink-0`}>
        <div className="flex flex-row items-center justify-center h-12 w-full">
          <div
            className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              ></path>
            </svg>
          </div>
          <div className="ml-2 font-bold text-2xl">NexoTalk</div>
         
        </div>
        <div
          className="flex flex-col items-center bg-indigo-100 border border-gray-200 mt-4 w-full py-6 px-4 rounded-lg"
        >
          <div className="h-20 w-20 rounded-full border overflow-hidden">
            <img
              src={JSON.parse(localStorage.getItem('user')).data.profileAvatar}
              alt="Avatar"
              style={{objectFit:'cover'}}
              className="h-full w-full"
            />
          </div>
          <div className="text-sm font-semibold mt-2">{JSON.parse(localStorage.getItem('user')).data.username}</div>
          <div className="text-xs text-gray-500">Lead UI/UX Designer</div>
     
          <div className="flex justify-center">
  <div className="form-check form-switch">
    <input className="form-check-input appearance-none w-9 -ml-10 rounded-full float-left h-5 align-top bg-white bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm" type="checkbox" role="switch" id="flexSwitchCheckChecked" 
     onClick={()=>setChecked(!checked)}
    defaultChecked={checked} />
    <label className="form-check-label inline-block text-gray-800" htmlFor="flexSwitchCheckChecked">Theme</label>
  </div>
</div>
          <button  onClick={()=>{navigate('/')}}className="bg-transparent hover:bg-blue-500 mt-2 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded">
  Logout
  
</button>
        </div>

        <div className="flex flex-col mt-8">
          <div className="flex flex-row items-center justify-between text-xs">
            <span className="font-bold">Active Conversations</span>
          
            <span
              className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full"
              >{currentUsers.length}</span
            >
          </div>
          <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
            {currentUsers!=[] ? currentUsers.map((user)=>{
                  
            return <React.Fragment key={user._id}>   
             <button
             onClick={()=> { 
              setUserToDM(user)
              setIsDirectMessage(true)
            }
            }
              className="flex flex-row items-center hover:bg-orange-300 rounded-xl p-2"
            >
              <div
                className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full"
                style={{background:`url(${user.profileAvatar})`,backgroundSize:'cover'}}
              >
               </div>
              <div className="ml-2 text-sm font-semibold">{user.username}</div>
              <div
                className="flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none"
              >
                {/* { newMessageReceivedNotif &&  } */}
              </div>
              <div className="flex space-x-2 justify-center">
</div>
            </button>
            </React.Fragment>
            }): <p>No available users</p>}
            
       
          </div>
          <div className="flex flex-row items-center justify-between text-xs mt-6">
            <span className="font-bold">Archived</span>
            <span
              className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full"
              >7</span
            >
          </div>
          <div className="flex flex-col space-y-1 mt-4 -mx-2">
            <button
              className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2"
            >
              <div
                className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full"
              >
                H
              </div>
              <div className="ml-2 text-sm font-semibold">Henry Boyd</div>
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-auto h-full p-6" style={{backgroundColor:'#9c88ff'}}>
        <div
          className={`flex flex-col flex-auto flex-shrink-0 rounded-2xl  ${checked ? 'bg-electro-magnetic' :'bg-white'} h-full p-4`}
        >
          <div className="flex flex-col h-full overflow-x-auto mb-4">

            <div className="flex flex-col h-full">
              <div className="grid grid-cols-12 gap-y-2">
                {messages ?  messages.map( (message) =>  {
                    return( 
               <React.Fragment key={message._id}>  
               {
                        message.messageSender == currentUserId && message.messageReceiver == userToDM._id ?    
             <div className="col-start-1 col-end-8 p-3 rounded-lg">
               
                  <div className="flex flex-row items-center">
                  <img src={user.data.profileAvatar} 
                   className=' object-cover h-10 w-10 rounded-full'/>
                     
                    <div
                      className="relative ml-3 text-sm bg-gradient-to-r text-white	 from-indigo-500 via-purple-500 to-pink-500 py-2 px-4 shadow rounded-xl"
                    >
                      <p className='break-words	w-80	'>{message.contents}</p>
                    </div>
                  </div>
                </div>
               :'' }
            
                <div className="col-start-6 col-end-13 p-3 rounded-lg">
                  
                     
                        {
                        message.messageReceiver == currentUserId && message.messageSender == userToDM._id ?  
                         <div className="flex items-center justify-start flex-row-reverse">
                         <div
                           className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0"
                         >
                           <img src={userToDM.profileAvatar} 
                        className=' object-cover h-10 w-10 rounded-full'/>
                         </div>
                            <div
                            className="relative mr-3 text-white text-sm bg-gradient-to-r from-pink-500 to-yellow-500 py-2 px-4 shadow rounded-xl"
                          >
                        <div>{message.contents} </div> 
                        <div
                        className="absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-gray-500"
                      >
                        Seen
                      </div>
                    </div>
                    </div>

                        : ''}
                      
                     
                 </div>
                 <div ref={messagesBottom} />

                </React.Fragment>
                
                )
                }):''}
                            
                    { emojiSelected &&  <Picker data={data} onEmojiSelect={console.log} style={{zIndex:100,position:'fixed'}}/> }

              </div>
            </div>
          </div>

          <div
            className={`flex flex-row items-center h-16 rounded-xl ${checked ? 'bg-dark' : 'bg-white'} w-full px-4`}
          >
            <div>

              <button
                className="flex items-center justify-center text-gray-400 hover:text-gray-600"
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
            </div>
            <div className="flex-grow ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={message}
                  onChange={(e)=>setMessage(e.target.value)}
                  className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                />
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
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
           onClick={(e)=>sendMessage(e)}   >
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
    </div>
  </div>
  )
}

export default Chat