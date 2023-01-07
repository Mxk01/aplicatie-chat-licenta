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
mongoose.connect(process.env.MONGO_URI).then(()=>console.log('Connected to mongo'))
.catch(e=>console.log(e))
app.use(cors());
// means use the /uploads folder to serve static assets
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(express.json())
app.use('/api/chat',routesUser)
app.use('/api/user',routesUser)
app.use('/api/admin',routesAdmin)



app.listen(5000,()=>{console.log('Primeste request-uri la portul 5000')})