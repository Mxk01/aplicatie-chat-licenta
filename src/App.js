import React,{Suspense} from 'react'
import { Routes, Route,Navigate} from "react-router-dom";
import Video from './components/Video/Video';
const Login = React.lazy(() => import('./components/Auth/Login/Login'));
const Register =  React.lazy(()=> import('./components/Auth/Register/Register'));
const Chat = React.lazy(()=> import('./components/Chat/Chat'))
function App() {
  return (
    <div className="App">
       <Suspense fallback={<div>Loading...</div>}>
      <Routes>

        <Route exact path="/" 
        element={!JSON.parse(localStorage.getItem('user')) ? <Suspense fallback={<p>Loading ...</p>}> 
        <Login/></Suspense>:<Navigate to="/chat"></Navigate>}
        />
        <Route path="/video-call" element={JSON.parse(localStorage.getItem('user')) ? <Suspense fallback={<p>Loading ...</p>}> 
        <Video /></Suspense>:<Navigate to="/"></Navigate>} />
        
        <Route path="/register" 
        element={!JSON.parse(localStorage.getItem('user')) ? <Suspense fallback={<p>Loading ...</p>}> 
        <Register/></Suspense>:<Navigate to="/chat"></Navigate>} />

          <Route path="/chat" element={JSON.parse(localStorage.getItem('user')) ? <Suspense fallback={<p>Loading ...</p>}> 
        <Chat /></Suspense>:<Navigate to="/"></Navigate>}
         />
      </Routes>
      </Suspense>
    </div>
  );
}

export default App;
