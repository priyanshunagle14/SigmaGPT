import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ChatProvider, useChat } from "./context/ChatContext.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function MainLayout() {
  const { sidebarOpen, setSidebarOpen } = useChat();

  return (
    <>
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <ChatWindow />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<MainLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
