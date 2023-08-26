let express = require('express');
let path = require('path')
let dotenv = require('dotenv');
let {connectToDatabase} = require('./utils')
dotenv.config();
let app = express(); 
let routesUser = require('./routes/userRoutes')
let routesAdmin = require('./routes/adminRoutes')
let routesChat = require('./routes/chatRoutes')
let cors = require('cors');
let http = require('http')
const host = process.env.HOST || '0.0.0.0';
let server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server,{
    cors : {
        origin :'*',
        methods:['GET','POST'],
        credentials:true
    }
});

connectToDatabase();
app.use(cors({origin:'*'}));

app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(express.json())
app.use('/api/chat',routesChat)
app.use('/api/user',routesUser)
app.use('/api/admin',routesAdmin)

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
    io.to(sId).emit('receive-message',{message,userReceiverID:sId})
    
    }
   })

   socket.on('logout',()=>{
    utilizatoriOnline = stergeUtilizator(socket.id);
    io.emit('utilizator-online',utilizatoriOnline)
   })
   

   socket.on('disconnect',()=>{
   })
})

server.listen(process.env.PORT || 5000,()=>{console.log('Primeste request-uri la portul 5000')})