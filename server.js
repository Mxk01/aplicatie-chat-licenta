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
        origin :'http://localhost:3000',
        methods:['GET','POST']
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
 // sId inseamna socketId
 // daca nu este niciun utilizator cu acest username  atunci executa cea de-a doua expresie
 !utilizatoriOnline.some(uOn => uOn.username === username ) && utilizatoriOnline.push({username,sId,isConnected:true})
}
const stergeUtilizator = (sId) => {
   // deconecteaza utilizator
  //  console.log('dasadsd'+utilizatoriOnline.filter(u=>u.sId == sId).map((u)=>u.username));
//    utilizatoriOnline.filter(u=>u.sId == sId)[0].isConnected = false
// console.log(`Lista util curenti ${utilizatoriOnline[0]}`)
}
const  getUtilizatorOnline = (username) => {
      return utilizatoriOnline.find(user => user.username == username);
}

io.on('connection',(socket)=>{

    socket.on('utilizator-nou-online',(username)=>{
    
       adaugaUtilizator(username,socket.id);
      //  console.log(utilizatoriOnline);
       if(utilizatoriOnline.length > 0) { 
       io.emit('utilizator-online',utilizatoriOnline)
       }
    })

    socket.on('creeaza-room',({groupName,groupMembers})=> {
      console.log(groupName,groupMembers)
    })
    socket.on("trimiteNotificare",({ senderName,receiverName,mesaj })=>{
        // console.log(`Sender name ${senderName}, Receiver name ${receiverName}`)
        let userReceiverID = getUtilizatorOnline(receiverName);
        // console.log(`Detalii user receiver : ${userReceiverID} `)
         if(userReceiverID) {
            // obtine id-ul persoanei careia vrem sa ii trimitem notificarea 
            let {sId} = userReceiverID;
         
        io.to(sId).emit("obtineNotificare",{receiverName,mesaj})
        }
        else {
          console.log('Acest utilizator nu este online!')  
          return; 
        }
    })
   


   socket.on('send-message',({message,senderName,receiverName})=>{
    let userReceiverID = getUtilizatorOnline(receiverName);
    if(userReceiverID!=undefined) {
    let {sId} = userReceiverID;
    io.to(sId).emit('receive-message',message)
    }
   })
   socket.on('disconnect',()=>{
    stergeUtilizator(socket.id);
   })
})

server.listen(5000,()=>{console.log('Primeste request-uri la portul 5000')})