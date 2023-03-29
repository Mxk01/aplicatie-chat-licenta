import './App.css';
import { Routes, Route } from "react-router-dom";
import Video from './components/Video/Video';
import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Login />}/>
        <Route path="/video-call" element={<Video />} />
                  <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;
