import React, {useEffect, useState,useRef} from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import {io} from 'socket.io-client'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'


function Chat() {
  const messagesBottom = useRef(null);
  let [groupName,setGroupName] = useState('');
  let [currentEmoji,setCurrentEmoji] = useState({})
  let [notificationCount,setNotificationCount] = useState(0);
  let [emojiSelected,setEmojiSelected] = useState(false)
  let [socket,setSocket]  = useState(null)
  let [currentUsers,setCurrentUsers] = useState([]);
  let [directMessages,setDirectMessages] = useState([]);
  let [userToDM,setUserToDM] = useState({});
  let [user,setCurrentUser]  = useState(JSON.parse(localStorage.getItem('user')));
  let config = { headers : {'Authorization' : `Bearer ${JSON.parse(localStorage.getItem('user')).data.token}` }}
  let navigate = useNavigate()
  let [groupForm,setGroupForm] = useState(false);
  let [checked,setChecked] = useState(false);
  let [message,setMessage] = useState('')
  let [groupMembers,setGroupMembers] = useState([])
  let [dropDownVisible,setDropDownVisible] = useState(false);
  let [isDirectMessage,setIsDirectMessage] = useState(false);
  let [isGroupMessage,setIsGroupMessage] = useState(false);
  let [messages,setMessages] = useState([]);
  let [currentUserId,setCurrentUserId] = useState(''); 
  let [mSender,setMsender]= useState('');
  let [mReceiver,setMReceiver] = useState('')
  let [isTyping ,setIsTyping ] = useState(false)
  let [connectedUsers,setConnectedUsers] = useState([]);
  // let [connectedUser,setConnectedUser] = useState({username:'Test',isConnected:false})
  // mesaj - Gogu is typing ... 
  let [isTypingMessage,setIsTypingMessage]  = useState('')
  useEffect(() => {
    setSocket(io("http://localhost:5000"));
  }, []);

   useEffect(()=>{

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
      
       // socket este nullabil pentru ca initial este setat in state ca null ,daca exista socket evenimentul poate fi emis
      socket?.on('receive-message',async({message})=>{
        if(message.contents && message.receiverId == userToDM._id){
        setMessages([...messages,message.contents]);
       setNotificationCount(nCount => nCount+1) }
           
        
      })
      
    },[socket])

    useEffect(()=>{
      socket?.on('utilizator-online',(utilizatoriOnline)=>{
          // filtreaza lista de utilizatori sa apara utilizatorii mai putin  utilizatorul curent 

        setConnectedUsers(utilizatoriOnline.filter(u=> u.username != user.data.username));
        })

    },[socket])
     let createGroup = async(groupName) => {
    
        // converting group members into an object 
      
            
           let result =  await axios.post('/api/user/create-chat-group',{groupName,groupMembers})
           console.log(result);
          
       
       // check for status 200 , if everything is ok ,update UI (make new item for group on Groups section)
       // send to server groupName and groupMembers array 
       socket.emit('creeaza-room',{groupName,groupMembers})
     }
    let adauga_emoji = (emoji_selectat)=>{
      // emoji in unicode ex. 1f923
      const emoji_codat = emoji_selectat.unified.split("_")
      const elemente_emoji_codat =  [];
      // ex.  0x1f923
      emoji_codat.forEach(element_emoji =>  elemente_emoji_codat.push("0x"+element_emoji));
      let emoji_final = String.fromCodePoint(...elemente_emoji_codat);
      setMessage(message+emoji_final)

    }
        let sendMessage = async(e) => {
          e.preventDefault();
 
  // console.log("Sender ID " + sender.data.currentUser._id);
  // console.log("Receiver ID " + userToDM._id);
        let sender = await axios.get('/api/user/get-current-user',config);
       
        if(userToDM && isDirectMessage && message!=''){
          
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

<div id="authentication-modal" tabIndex="-1" aria-hidden="true" className={`fixed top-0 left-0 right-100  	 z-50 ${groupForm ? '':'hidden'} w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full`}>
    <div className="relative w-full h-full max-w-md md:h-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-800">
            <button type="button"
            onClick={()=> setGroupForm(!groupForm)
              } className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                <span className="sr-only">Close modal</span>
            </button>
            <div className="px-6 py-6 lg:px-8  self-center		">
                {/* <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3> */}
                <form className="space-y-6" action="#">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nume Grup</label>
                        <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Nume Grup " required
                        onChange={(e)=>{
                          setGroupName(e.target.value)}}/>
                    </div>
                    <button id="dropdownDefaultButton"
                    onClick={()=>setDropDownVisible(!dropDownVisible)} data-dropdown-toggle="dropdown" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" type="button">Available <svg className="w-4 h-4 ml-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
<div id="dropdown" className={`z-10 ${dropDownVisible ? '' :'hidden'}   bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700`}>
    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
       
     { currentUsers && currentUsers.map(c =>  (
    <div className='pb-2 pl-2' key={c.username}>
           

    <div id="tooltip-jese" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
    {c.username}
        <div className="tooltip-arrow" data-popper-arrow>         </div>
     </div>
     <div className='flex justify-center align-center'>  
    <img data-tooltip-target="tooltip-jese" className="w-10 mr-2 h-10 rounded object-cover" src={c.profileAvatar} alt="Medium avatar"/>
    <button type="button" className="text-white ml-6 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-900 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:focus:ring-blue-600"
    onClick={()=>{ 
      // update group members array
      setGroupMembers([...new Set([...groupMembers,{userIdDB:c._id,userNameSocket:c.username}])])

      console.log(c._id)
      
    }}>Add</button>
    </div>
  </div>
      
    ))}
    </ul>
</div>
                    
                    <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    onClick={(e)=>{
                     e.preventDefault()
                      //  numeleGrupului , id-ul utilizatorului din baza de date (pt adaugare in BD), username-ul utilizatorului 
      // de la sockets
      createGroup(groupName,)
                    }}>Save</button>
               
                </form>
            </div>
        </div>
    </div>
</div> 
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
        <button type="button" className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
        onClick={(e)=>setGroupForm(!groupForm)}> Create Group </button>

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
           
               <div className="relative">
    <img className="w-10 h-10 rounded-full object-cover" src={`${user.profileAvatar}`} alt=""/>
   
   {/* { 
    

   connectedUser.isConnected && connectedUser.username == user.username ? <span className="top-7 left-7 absolute  w-3 h-3 bg-green-400 border-4s		 rounded-full"></span>
         : <span className="top-7 left-7 absolute  w-3 h-3 bg-red-400 border-4s		 rounded-full"></span>   } */}

{ 
    
    connectedUsers.length > 0 && connectedUsers.map( cUser =>(
      
      cUser.isConnected &&  cUser.username == user.username 
        ? (<span className="top-7 left-7 absolute  w-3 h-3 bg-green-400 border-4s		 rounded-full"></span>
        
        
       ) : 
       (<span className="top-7 left-7 absolute  w-3 h-3 bg-red-400 border-4s		 rounded-full"></span> )
    )
          )
      }
</div>
              <div className="ml-2 text-sm font-semibold">{user.username}</div>
              <div
                className="flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none"
              >
                {notificationCount}
              </div>
              <div className="flex space-x-2 justify-center">
</div>
            </button>
            </React.Fragment>
            }): <p>No available users</p>}
            
       
          </div>
          <div className="flex flex-row items-center justify-between text-xs mt-6">
            <span className="font-bold">Groups</span>
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
                F
              </div>
              <div className="ml-2 text-sm font-semibold">Fake Group</div>
            </button>
          </div>
        </div>
      </div>
      { userToDM ?  (
      <div className="flex flex-col flex-auto h-full p-6 scroll-smooth" style={{backgroundColor:'#9c88ff'}}>
        <div
        // onClick={()=>setEmojiSelected(!emojiSelected)}
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

             
                            
                    { emojiSelected &&  <Picker data={data} onEmojiSelect={adauga_emoji} style={{zIndex:100,position:'fixed'}}/> }

                    {/* {isTyping ?  (<div className="col-start-6 col-end-13 p-3 rounded-lg">
                  
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
               <div>{isTypingMessage} </div> 
               <div
               className="absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-gray-500"
             >
               
             </div>
           </div>
           </div>
           </div>): ''} */}
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
                  onInput = { (e) => { 
                    socket.emit('isTyping',{ user : user.username,message:` is typing ...  `})
                  }}
                          onClick={()=>setEmojiSelected(!emojiSelected)}

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
      </div>):''}
    </div>
  </div>
  )
}

export default Chat