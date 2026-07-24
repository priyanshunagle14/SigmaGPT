import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import { MyContext } from "./MyContext.jsx";
import { useState } from 'react';

import { v1 as uuidv1 } from "uuid";
import { BrowserRouter, Routes, Route } from "react-router-dom";


function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({
    token: localStorage.getItem("token"),
    username: localStorage.getItem("username")
  });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    user, setUser,
    toast, showToast,
    sidebarOpen, setSidebarOpen,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={providerValues}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <>
              {sidebarOpen && (
                <div className="overlay" onClick={() => setSidebarOpen(false)} />
              )}
              <div className="app">
                <Sidebar />
                <main className="main-content">
                  <ChatWindow />
                </main>
              </div>
            </>
          } />
        </Routes>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;