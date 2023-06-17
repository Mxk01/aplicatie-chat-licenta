import { useContext } from "react";
import axios from 'axios'
import {io} from 'socket.io-client'
import { useCallback,useState,createContext,useEffect,useRef,memo } from "react";
import { useNavigate } from "react-router";

export let ChatContext = createContext();
 




export  let ChatProvider = memo(({children})=>{
  let term =  useRef(null) 

  const messagesBottom = useRef(null);
  let [currentEmoji,setCurrentEmoji] = useState({})
  let [notificationCount,setNotificationCount] = useState(0);
  let [emojiSelected,setEmojiSelected] = useState(false)
  let [isOnline,setIsOnline] = useState(false)
  let [groupMessage,setGroupMessage] = useState('')
  let [directMessages,setDirectMessages] = useState([]);
  let navigate = useNavigate()
  let [groupForm,setGroupForm] = useState(false);
  let [selectedGroup,setSelectedGroup] = useState({})
  let [checked,setChecked] = useState(false);
  let [dropDownVisible,setDropDownVisible] = useState(false);
  let [isGroupMessage,setIsGroupMessage] = useState(false);
  let [isTyping ,setIsTyping ] = useState(false)
  let [connectedUsers,setConnectedUsers] = useState([]);
  let [isTypingMessage,setIsTypingMessage]  = useState('')
  let [currentUserId,setCurrentUserId] = useState(''); 
  const [socket,setSocket] = useState(null);
  let [user,setCurrentUser]  = useState(JSON.parse(localStorage.getItem('user')));
  let [isDirectMessage,setIsDirectMessage] = useState(false);
  let [groups,setGroups] = useState([]);
  let [message,setMessage] = useState('')
  let [messages,setMessages] = useState([]);
  let [currentUsers,setCurrentUsers] = useState([]);
  let [userToDM,setUserToDM] = useState({});
  let [groupName,setGroupName] = useState('');
  let [groupMembers,setGroupMembers] = useState([])
  let config = { headers : {'Authorization' : `Bearer ${JSON.parse(localStorage.getItem('user')).data.token}` }}
  let [groupMessages,setGroupMessages] = useState([]);
  useEffect(() => {
    setSocket(io("https://nexotalk.onrender.com/"));
    let getCurrentUserId = async() => {
      // if some issue occurs add ? at the end of it 
    let sender = await axios.get('https://nexotalk.onrender.com/api/user/get-current-user', config);
    setCurrentUserId(sender?.data.currentUser._id);
    }
    getCurrentUserId()
   
  }, []);

  let searchUsers = useCallback(async () => {
    const searchTerm = term.current.value.trim().toUpperCase();
    let users = currentUsers;
    if (searchTerm) {
      const firstChar = searchTerm[0];
      
      users = currentUsers.filter(u => {
        const username = u.username.trim().toUpperCase();
        return username === searchTerm || username.startsWith(firstChar);
      });
      setCurrentUsers(users);
    }
    else {
      getCurrentUsers();
    }
  })

const createGroup = useCallback(async (groupAdmin) => {
  let allMembers = [...groupMembers,groupAdmin]; // all members including admin
  let result = await axios.post('https://nexotalk.onrender.com/api/user/create-group',{groupName,groupMembers:allMembers});
  setGroups([...groups,result.data.group])
}, [groupName, groupMembers]);



const getCurrentUsers = useCallback(async () => {
  let users = await axios.get('https://nexotalk.onrender.com/api/user/users-list', config);
  setCurrentUsers(users.data.message)
}, []);

const getCurrentGroups = useCallback(async () => {
  let groups = await axios.get('https://nexotalk.onrender.com/api/user/get-groups')
  setGroups(groups.data);
}, []);


 

const adauga_emoji = useCallback((emoji_selectat) => {
  const emoji_codat = emoji_selectat.unified.split("_");
  const elemente_emoji_codat =  [];
  emoji_codat.forEach(element_emoji => elemente_emoji_codat.push("0x"+element_emoji));
  let emoji_final = String.fromCodePoint(...elemente_emoji_codat);
  setMessage(message + emoji_final);
}, [message]);

 const sendGroupMessage = useCallback(async (e,groupName)=>{
  e.preventDefault();
  let sender = await axios.get('https://nexotalk.onrender.com/api/user/get-current-user', config);

   if(groupMessage!='' && sender.data.currentUser._id) {
    console.log(sender.data.currentUser._id)
    let gMessage = await axios.post(`https://nexotalk.onrender.com/api/user/add-group-message/${groupName}/`,{contents:groupMessage,isDirectMessage:false,senderId:sender.data.currentUser._id})
    if(gMessage.status == 200) {
    getCurrentGroup(groupName)
    setGroupMessage('')
    }
  }
 })

 const getCurrentGroup = useCallback(async (groupName) => {
  let group = await axios.get(`https://nexotalk.onrender.com/api/user/get-group-messages/${groupName}`);
  setGroupMessages(group.data.messages);
}, [groupName]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    let sender = await axios.get('https://nexotalk.onrender.com/api/user/get-current-user', config);
  
    if (userToDM && isDirectMessage && message != '') {
      let messageOptions = {isDirectMessage:true, contents:message, photoPath:user.data.profileAvatar};
      socket?.emit('send-message', {
        message: {...messageOptions},  
        senderName: user.username, 
        receiverName: userToDM.username
      });
  
            let directMessage = await axios.post(`https://nexotalk.onrender.com/api/user/add-message/${currentUserId}/${userToDM._id}`,messageOptions);
            setMessage('')
    
          }
        
        })

  const showMessages = useCallback(async () => {
    if (isDirectMessage && userToDM) {
      
  
      // swap the ids
      let directChatMessages = await axios.get(`https://nexotalk.onrender.com/api/user/direct-messages/${currentUserId}/${userToDM._id}`, config);
  
      setMessages(directChatMessages.data.messages);
    }
  }, [isDirectMessage, userToDM]);

const emitUserOnline = useCallback(() => {
  socket?.emit("utilizator-nou-online", user.data.username);
}, [socket, user.data.username]);

useEffect(() => {
  emitUserOnline();
}, [emitUserOnline]);


useEffect(() => {
  if (JSON.parse(localStorage.getItem('user')).data.token) {
    getCurrentGroups();
    getCurrentUsers();
  }
}, [getCurrentGroups, getCurrentUsers]);

 
useEffect(() => {
  showMessages();
  messagesBottom.current?.scrollIntoView({behavior: 'smooth'});
}, [showMessages, messages, userToDM, emojiSelected]);

useEffect(() => {
  socket?.on('utilizator-online', (utilizatoriOnline) => {
    setIsOnline(true)
    setConnectedUsers(utilizatoriOnline.filter(u => u.username != user.data.username));
  });

  socket?.on('receive-friend-request', (msg) => {
    alert(msg)
  });

  socket?.on('receive-message', async ({message,userReceiverId}) => {
    if (message.contents!='' && userReceiverId == userToDM._id) {
      setMessages(prevMessages => [...prevMessages, message.contents]);
    }
  });

  return () => socket?.off('receive-friend-request');
}, [socket, userToDM, messages,connectedUsers]);


  
 
    let chatUtils = {
        /* Methods */
        createGroup,
        groupMessages,
        getCurrentGroup,
        getCurrentGroups,
        getCurrentUsers,
        adauga_emoji,
        sendMessage,
        searchUsers,
        showMessages,
        /* state variables */
          messagesBottom,
          currentEmoji,
          setCurrentEmoji,
          notificationCount,
          setNotificationCount,
          emojiSelected,
          setEmojiSelected,
  isOnline,
  setIsOnline,
  directMessages,
  navigate,
  groupForm,
  setGroupForm,
  selectedGroup,
  setSelectedGroup,
  checked,
  setChecked,
  dropDownVisible,
  setDropDownVisible,
  isGroupMessage,
  setIsGroupMessage,
  isTyping,
  setIsTyping,
  connectedUsers,
  isTypingMessage,
  setIsTypingMessage,
  currentUserId,
  setCurrentUserId,
  socket,
  setSocket,
  groupMessage,
  setGroupMessage,
  user,
  setCurrentUser,
  isDirectMessage,
  setIsDirectMessage,
  groups,
  term,
  setGroups,
  message,
  setMessage,
  messages,
  setMessages,
  currentUsers,
  setCurrentUsers,
  userToDM,
  setUserToDM,
  groupName,
  sendGroupMessage,
  setGroupName,
  groupMembers,
  setGroupMembers,
  config,

    }

  return  <ChatContext.Provider value={chatUtils}>
          { children}
  </ChatContext.Provider>

})

