import { useContext } from "react";
import axios from 'axios'
import {io} from 'socket.io-client'
import { useCallback,useState,createContext,useEffect,useRef,memo } from "react";
import { useNavigate } from "react-router";

export let ChatContext = createContext();
 




export  let ChatProvider = memo(({children})=>{
   
  const messagesBottom = useRef(null);
  let [currentEmoji,setCurrentEmoji] = useState({})
  let [notificationCount,setNotificationCount] = useState(0);
  let [emojiSelected,setEmojiSelected] = useState(false)
  let [isOnline,setIsOnline] = useState(false)
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
    setSocket(io("http://localhost:5000"));

  }, []);



const createGroup = useCallback(async () => {
  let result = await axios.post('/api/user/create-group',{groupName,groupMembers});
}, [groupName, groupMembers]);



const getCurrentUsers = useCallback(async () => {
  let users = await axios.get('/api/user/users-list', config);
  setCurrentUsers(users.data.message)
}, []);

const getCurrentGroups = useCallback(async () => {
  let groups = await axios.get('/api/user/get-groups')
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

     await axios.post(`/api/user/add-group-message/${groupName}`,{contents:message,isDirectMessage:false})
     setGroupMessages((prevGroupMessages) => [...prevGroupMessages, { contents: message }]);
 })

 const getCurrentGroup = useCallback(async (groupName) => {
  let group = await axios.get(`/api/user/get-group-messages/${groupName}`);
  setGroupMessages(group.data.messages);
}, [groupName]);

  const sendMessage = useCallback(async (e) => {
    e.preventDefault();
    let sender = await axios.get('/api/user/get-current-user', config);
  
    if (userToDM && isDirectMessage && message != '') {
      let messageOptions = {isDirectMessage:true, contents:message, photoPath:''};
      socket?.emit('send-message', {
        message: {...messageOptions},  
        senderName: user.username, 
        receiverName: userToDM.username
      });
  
            let directMessage = await axios.post(`/api/user/add-message/${sender.data.currentUser._id}/${userToDM._id}`,messageOptions);
            setMessage('')
    
          }
        
        })

  const showMessages = useCallback(async () => {
    if (isDirectMessage && userToDM) {
      let sender = await axios.get('/api/user/get-current-user', config);
      setCurrentUserId(sender.data.currentUser._id);
  
      // swap the ids
      let directChatMessages = await axios.get(`/api/user/direct-messages/${sender.data.currentUser._id}/${userToDM._id}`, config);
  
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

  socket?.on('receive-message', async ({message}) => {
    if (message.contents && message.receiverId == userToDM._id) {
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
  user,
  setCurrentUser,
  isDirectMessage,
  setIsDirectMessage,
  groups,
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

    }

  return  <ChatContext.Provider value={chatUtils}>
          { children}
  </ChatContext.Provider>

})

