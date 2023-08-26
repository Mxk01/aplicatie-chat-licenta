let User = require('../models/User')
let Group = require('../models/Group')
let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let dotenv = require('dotenv');
let jwt = require('jsonwebtoken');
let Message = require('../models/Message')
let multer = require('multer')
let mongoose = require('mongoose')
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

 
dotenv.config()


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'NexoStorage',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});


const upload = multer({ storage });





let isUserAuthenticated = async(req,res,next) =>{
    let {authorization} = req.headers;
    if(authorization && authorization.startsWith("Bearer")){
    try{
    
       // get token from authorization request headers
       let token = authorization.split(' ')[1];
      
       // get user id (this data was set up on jwt.sign)
       let {_id} =  jwt.verify(token,process.env.JWT_SECRET)
        req.user = await User.findById(_id).select('--password');
        
       next();
     } 
     catch(e){
        return res.status(403).json({message:'You are not authorized to access this resource'})
     } }
     else {
         return res.status(403).json({message:'You are not authorized to access this resource'})
 
     }
     
 
 
 
 }


router.post('/create-user',upload.single('profileAvatar'),async(req,res)=>{
  let user = new User(req.body);
    req.body.password  = await bcrypt.hash(req.body.password,10)
    try {
    const resizedImage = cloudinary.url(req.file.filename,{
      transformation:[
        {width:150,height:150,crop:'fill',crop:'fill'}
      ]
       
    })
    
    req.body.profileAvatar = resizedImage;
    user.profileAvatar = req.body.profileAvatar;
  }
  catch(e){
    res.status(200).json({error:e.message});
  }
  

  let token =  jwt.sign(req.body,process.env.JWT_SECRET,{expiresIn:Date.now()+14400000});
  user.password = req.body.password;
  user.token = token;
    User.exists({email:req.body.email},(err,doc)=>{
        if(err) { return res.status(500).json({error:err.message}); }
        else { 
            if(doc){
               return  res.status(409).json({message:"Username already exists!"})
            }
        }
    })
  
    await user.save();
     return  res.status(200).json({message:user});
  
});

router.post('/login-user',(req,res)=>{
     User.exists({email:req.body.email},async(err,doc)=>{
        if(err) { console.log(err.message); }
        else { 
            if(doc){
                let user = await User.findById({_id:doc._id});
                let passwordsMatch = await bcrypt.compare(req.body.password,user.password);
                if(passwordsMatch){
                    let token =  jwt.sign(
                        {
                         _id:user._id 
                        } ,process.env.JWT_SECRET,{expiresIn:Date.now()+14400000});
                        let {username,profileAvatar} = user;
               return  res.status(200).json({username,profileAvatar,token});
                  
              }
             }
            else {
                 res.status(404).json({message:"Username doesn't exist!"})
            }
        }
    })    
})

router.get('/users-list',isUserAuthenticated,async(req,res)=>{
   
       let users  = await User.find({}).where('_id').ne(req.user._id).lean();
       return res.status(200).json({message:users});

    
  })


  router.get('/find-user/:email',async(req,res)=>{
   let email = req.params.email;
   User.exists({email},(err,doc)=>{
     if(err) res.status(404).json({message:e})
    if(doc?._id) {
        res.status(409).json({message:'Username already exists!'})
    }
    else {
        res.status(404).json({message:'No such user'})
    }
   }) 
  })

  router.get('/get-current-user',isUserAuthenticated,(req,res)=>{
    res.json({currentUser:req.user})
});


router.get('/direct-messages/:senderId/:receiverId',isUserAuthenticated,async(req,res)=>{
  try {
  let messageSender = req.params.senderId;
  let messageReceiver = req.params.receiverId;
   let messages =  await Message.find({isDirectMessage:true,
    // verifica daca una din conditii a fost satisfacuta :
    $or: [
      { messageSender: messageReceiver }, 
      { messageSender }, 
      { messageReceiver: messageSender },
      {messageReceiver}]
    }
   ).lean();
   res.status(200).json({messages});
  }
  catch(e){
    res.json({error : e.message})
  }

  })

router.get('/get-group-messages/:group',async(req,res)=> {
  try {
  let messages = await Message.find({isDirectMessage:false,messageGroup:req.params.group}).populate('messageSender', 'username').lean()
  
  res.status(200).json({messages});
  }
  catch(e){
    res.status(404).json({error:e.message})
  }

})

router.post('/add-message/:senderId/:receiverId',async(req,res)=>{
  try {
    // receives both senderId and receiverId 
  let senderId = req.params.senderId;
  let receiverId = req.params.receiverId;
  let {isDirectMessage,contents,photoPath} = req.body;
  let message = new Message({
    messageSender:senderId,
    messageReceiver:receiverId,
    isDirectMessage,
    contents,
    photoPath
  });
  await message.save();
  res.json({message});
  }
  catch(e){
    res.json({error:e.message})
  }

});



router.post('/add-group-message/:groupName',async(req,res)=>{
  try {
  let {groupName} = req.params;
  let {isDirectMessage,contents,senderId} = req.body;
  let message = new Message({
    isDirectMessage,
    contents,
    messageGroup: groupName,
    messageSender:senderId
  });
  
  message = await message.save()
  
  res.status(200).json({ message });
  }
  catch(e){
    res.status(500).json({error:e.message})
  }

});






router.delete('/delete-messages',async(req,res)=>{
  await  Message.deleteMany();
})
  router.get('/get-groups',async(req,res)=>{
    let group = await Group.find({});
    res.json(group);
  })

   router.post('/create-group',async(req,res)=>{
      let group = new Group({groupName:req.body.groupName,groupMembers:req.body.groupMembers})
      group = await group.save();
      
        res.json({group})
  })


module.exports = router;