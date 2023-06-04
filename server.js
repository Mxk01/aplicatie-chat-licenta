let express = require('express');
let path = require('path')
let dotenv = require('dotenv');

dotenv.config();
let app = express(); 
let routesUser = require('./routes/userRoutes')
let routesAdmin = require('./routes/adminRoutes')
let routesChat = require('./routes/chatRoutes')
let mongoose = require('mongoose');
let cors = require('cors');
let http = require('http')
let server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server,{
    cors : {
        // origin is where we accept requests from
        origin :'https://nexo-talk.onrender.com/chat',
        methods:['GET','POST'],
        credentials:true
    }
});

mongoose.connect(process.env.MONGO_URI).then(()=>console.log('Connected to mongo'))
.catch(e=>console.log(e))
app.use(cors());
// means use the /uploads folder to serve static assets
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(express.json())
app.use('/api/chat',routesChat)
app.use('/api/user',routesUser)
app.use('/api/admin',routesAdmin)

// Array-ul utilizatoriOnline va avea urmatoarea structura 
//  [  { username : 'addasasd' , socketId : 'asdaq21e21wdqad' } , {username:'asdsad',socketId:'aw322r'}]
let utilizatoriOnline = [];



 const adaugaUtilizator = (username,sId) => {
 !utilizatoriOnline.some(uOn => uOn.username === username ) && utilizatoriOnline.push({username,sId,isConnected:true})
}
const stergeUtilizator = (sId) => {
   utilizatoriOnline = utilizatoriOnline.filter(u=>u.sId != sId)
   return utilizatoriOnline
}
const  getUtilizatorOnline = (username) => {
      return utilizatoriOnline.find(user => user.username == username);
}


io.on('connection',(socket)=>{

    socket.on('utilizator-nou-online',(username)=>{
    
       adaugaUtilizator(username,socket.id);
       io.emit('utilizator-online',utilizatoriOnline)
  

    })

   

    

    socket.on('friend-request',({receiverName,senderName})=>{
      let userReceiverID = getUtilizatorOnline(receiverName);
      if(userReceiverID!=undefined) {
      let {sId} = userReceiverID;
      io.to(sId).emit('receive-friend-request',`${senderName} v-a trimis o cerere de prietenie!`)
      
      }



     })


   socket.on('send-message',({message,receiverName})=>{
    let userReceiverID = getUtilizatorOnline(receiverName);
    if(userReceiverID!=undefined) {
    let {sId} = userReceiverID;
    io.to(sId).emit('receive-message',message)
    
    }
   })

   socket.on('logout',()=>{
    utilizatoriOnline = stergeUtilizator(socket.id);
    io.emit('utilizator-online',utilizatoriOnline)
   })
   

   socket.on('disconnect',()=>{
   
    // socket.emit('utilizator-online',utilizatoriOnline)

   })
})

server.listen(process.env.PORT || 5000,()=>{console.log('Primeste request-uri la portul 5000')})