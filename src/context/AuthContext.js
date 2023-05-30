import { createContext,useState } from "react";
import {useFormik} from 'formik'
import axios from 'axios'
import {Link,useNavigate} from 'react-router-dom'


export let AuthContext = createContext();


export let AuthProvider = ({children}) => {
    let [validationsOk,setValidationsOk] = useState(false);
    let [confirmPassword,setConfirmPassword] = useState('');
    let navigate = useNavigate();
    let formik = useFormik({
      initialValues : {
        profileAvatar:'',
        email:'',
        username:'',
        password:''
      },
      onSubmit: async(values)=>{
        
  
        let dateForma = new FormData();
        for(let value in values){
          // adaugam field-urile form-ului 
          // de forma  'photoUrl':'http://localhost:5000/whatever 
          dateForma.append(value,values[value]);
        }
        try {
        // validare empty fields
        if(values.username=='' || values.email=='' || values.password==''){
          alert("Please fill in all the fields!")
          navigate('/register')
          navigate(0)
        }
        else {
           setValidationsOk(true);
        }
          
          if(values.password.length<4  || values.password.length > 15){
            alert('Parola trebuie sa fie intre 4 si 15 caractere!')
            navigate('/register')
            navigate(0)
          }
          else {
            setValidationsOk(true);
          }
           
          if(values.profileAvatar.name!='' )  {
           
            setValidationsOk(true);
             
        
        
        }
          else {
            setValidationsOk(false)
            alert("Please upload an image!")
          }
  
          if(validationsOk)
          {
          let registeredUser = await axios.post('https://nexotalk.onrender.com/api/user/create-user',dateForma)
          console.log(registeredUser)
          navigate('/');
          navigate(0)
          }
          else {
            alert("Cannot register until all validations are correct!")
          }
      
      }
        catch(e){
  
        }
      }
    })
    let changeImage = (e) => {
      console.log(e.currentTarget.files)
       formik.setFieldValue('profileAvatar',e.currentTarget.files[0])
    }
    let values = {
        changeImage,
        formik,
        validationsOk,
        setValidationsOk,
        confirmPassword,
        setConfirmPassword
    }
   return <AuthContext.Provider value={values}>
     {children}
   </AuthContext.Provider>
}