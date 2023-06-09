import {FaRegWindowClose} from 'react-icons/fa'

import { useState,memo, useEffect, useCallback } from "react";

const Modal = ({ isOpen, onClose, messages,checked }) => {
  const [filteredMessages, setFilteredMessages] = useState([]);
  const date_restante = /(restante|restantier|re)/i;
  const filterMessages = useCallback(() => {
    setFilteredMessages(messages.filter((m) => date_restante.test(m.contents)));
  },[messages]);

  useEffect(() => {
    if (isOpen) {
    
      filterMessages();
    }
  }, [isOpen, messages]);
  
 

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50  ">
          <div className="fixed inset-0 w-1/2 h-1/2    bg-opacity-60"></div>
          <div className={`w-1/2 h-1/2  overflow-y-scroll ${!checked ? 'bg-white' : 'bg-gray-700'} rounded-lg p-8 shadow-lg relative flex-col`}>
            {/* Modal content goes here */}
            {filteredMessages.length > 0 &&
              filteredMessages.map((m) => (
                <div className="flex flex-col  " key={m._id}>
                 <div className="col-start-1 col-end-8 p-3 rounded-lg">
           
           <div className="flex flex-row items-center  ">
             <div
               className="relative ml-3 flex text-sm bg-gradient-to-l text-white w-60 max-h-20		break-words		 from-purple-400  to-green-400 py-2 px-4 shadow rounded-xl"
             >
               <p className='break-words	w-80	'>{m.contents}</p>
               <img  fetchpriority="low" src={m.photoPath} 
                   className=' object-cover h-5 w-5 rounded-full'/>
             </div>
           </div>
         </div>
                
                 
                </div>
              ))}
            <button className="absolute fixed top-0 right-0 m-4" onClick={onClose}>
              <FaRegWindowClose   size={'1.4rem'} color='#9c88ff'/>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Modal);
