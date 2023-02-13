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

io.on('connection',(socket)=>{
    let id = socket.id;
   console.log('User connected')
   socket.on('send-message',(message)=>{
    
    // emitting a private message
    io.to(id).emit('receive-message',message)
      
   })
})

server.listen(5000,()=>{console.log('Primeste request-uri la portul 5000')})