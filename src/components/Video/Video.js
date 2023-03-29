import {useState,useRef,useEffect} from 'react'
import { FaVolumeMute,FaVideoSlash } from "react-icons/fa";

import Peer from 'peerjs'
function Video() {
 let [myPeerId ,setMyPeerId] = useState('');
 // getting a reference to both videos
 const mVideo = useRef(null);
 const rVideo = useRef(null); 
 const [peerIdToConnect,setPeerIdToConnect] = useState('');
 const peerObj = useRef(null);
 let [user,setCurrentUser]  = useState(JSON.parse(localStorage.getItem('user')));

 let vOptions = {audio:false,video:true,width:200,height:200};
  useEffect(()=> {
    // peer instance 
   const peer = new Peer();
   
   peer.on("open",(currentPeerId)=>{
    // facem rost de id-ul peer-ului
    setMyPeerId(currentPeerId)
   })

   //  receiving a call 
   peer.on("call",async(call)=>{
   let  videoStream = await navigator.mediaDevices.getUserMedia(vOptions);
   console.log(videoStream)
    // show video and answer the call  (need to pass the MediaStream info to call.answer method )
    mVideo.current.srcObject  = videoStream;
    mVideo.current.play();
    alert(`${user.data.username} is calling you!!`)
    // primeste stream-ul user-ului curent 
    call.answer(videoStream);
    // MediaConnection emite un stream event ,in callback-ul de mai jos se "primeste" stream-ul celuilalt peer 
    call.on("stream",(peer2VStream)=> {
      console.log(peer2VStream)
      // peer2VStream reprezinta stream-ul celuilalt peer 
      rVideo.current.srcObject  = peer2VStream;
      rVideo.current.play();
    })
  })

  

    peerObj.current = peer;

   },[])

    // myPeerId is so other users can call me 
    // in order to call other users I just pass the id they got 
    let callPeer = async(otherPeer) => {
      let  videoStream = await navigator.mediaDevices.getUserMedia(vOptions);

        // play my stream 
      mVideo.current.srcObject  = videoStream;
      mVideo.current.play();
      // other peer is the id of the other person we want to connect with 
        let call =  peerObj.current.call(otherPeer,videoStream) 
        console.log(call);
        // MediaConnection object emits this stream, check  
        call.on("stream",(otherStream)=>{
          console.log(otherStream)
           // play the stream of the other person
          rVideo.current.srcObject  = otherStream;
          rVideo.current.play();
        })
      
    }
  return (
    <div className="flex items-center  justify-center flex-col		" style={{backgroundColor:"#2d3436",height:"100vh"}}>
      <p className='text-sky-400'> My connection id : {myPeerId}</p>
      <div className="flex items-center  justify-center ml-6	">  
        <input type="search" 
        onChange={ (e) => setPeerIdToConnect(e.target.value)}
        value={peerIdToConnect} id="default-search" className="
       block w-100 p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="My PEER ID..."/>
      <button 
      onClick={()=> callPeer(peerIdToConnect)}
      type="button" className="text-white  mt-2 bg-gradient-to-br pb-4 from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-md ml-2 text-sm px-5 py-2.5 text-center mr-2 mb-2">Connect</button>
      </div>
      <div  class=" items-center  flex">  
      <video style={{width:"300px",height:"300px",borderRadius:"30px"}} ref={mVideo}></video>
      <video style={{width:"300px",height:"300px",borderRadius:"30px"}}  className="ml-5"  ref={rVideo}></video>
      </div>
      <div className="flex justify-center items-center"> 
      <span class="bg-gray-100 flex justify-center items-center text-gray-800 text-xs font-medium mr-2 px-4 py-2   rounded dark:bg-gray-700 dark:text-gray-300">
      <FaVolumeMute className="cursor-pointer" color="#a29bfe" size="1.5rem" />
      <FaVideoSlash className="cursor-pointer ml-4" color="#a29bfe" size="1.5rem"  />
      </span>

       
      </div>
    </div>
  )
}

export default Video