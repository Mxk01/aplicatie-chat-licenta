let User = require('../models/User')
let Group = require('../models/Group')
let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let dotenv = require('dotenv');
let jwt = require('jsonwebtoken');
let Message = require('../models/Message')
let multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
      );
    },
  });

  const filefilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({ storage: storage, filefilter: filefilter });
  

dotenv.config()


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


// upload.single('profileAvatar')
router.post('/create-user',upload.single('profileAvatar'),async(req,res)=>{
     console.log(upload)
  let user = new User(req.body);
    req.body.password  = await bcrypt.hash(req.body.password,10)
    // req.protocol - http 
    //  req.get('host') - localhost
    req.body.profileAvatar  = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    //   expira in  4 ore de la data curenta 
   let token =  jwt.sign(req.body,process.env.JWT_SECRET,{expiresIn:Date.now()+14400000});
  user.password = req.body.password;
  user.profileAvatar = req.body.profileAvatar;
  user.token = token;
    User.exists({email:req.body.email},(err,doc)=>{
        if(err) { console.log(err.message); }
        else { 
            if(doc){
               return  res.status(409).json({message:"Username already exists!"})
            }
        }
    })
    await user.save();
    res.status(200).json({message:user});
  
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
   
       let users  = await User.find({}).where('_id').ne(req.user._id);
       return res.status(200).json({message:users});

    
  })


  router.get('/find-user/:email',async(req,res)=>{
   let email = req.params.email;
   User.exists({email},(err,doc)=>{
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
   );
   res.status(200).json({messages});
  }
  catch(e){
    res.json({error : e.message})
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

router.delete('/delete-messages',async(req,res)=>{
  await  Message.deleteMany();
})

// Rute pentru GRUP - trebuie refactorizate mai tarziu 

router.post('/create-chat-group',(req,res)=>{
  try { 
   let {groupName,groupMembers} = req.body;
  let chatGroup  = new Group({groupName})
  console.log(groupName)
    Group.exists({groupName},async(err,doc)=>{
     if(err) { console.log(err.message); }
     else { 
        if(doc){
          // 409 status code b/c resource already exists
           return  res.status(409).json({message:"A group  with this name already exists!"})
        }
        else {
          for(let groupMember of groupMembers)
          {
            // console.log(groupMember)
          chatGroup.groupMembers.push(groupMember.userIdDB)
          }
          chatGroup = await chatGroup.save(); 
          res.json({message:`Chat group has succesfully been created!`});
        }
    }
    
    })
  }
  catch(e) {
    res.status(500).json({error:e.message});
  }
})

router.get('/get-groups',async(req,res)=>{
  
  // find all the groups where the id of current user is in the groupMembers array 
  // let groups =  await Group.find({});
  // return  res.json({groups});
})

module.exports = router;