import { createContext, useContext, useState, useEffect } from 'react';
import { v1 as uuidv1 } from 'uuid';
import { chatApi } from '../services/api';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const AVAILABLE_MODELS = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    badge: "Flagship",
    description: "Highest reasoning, complex problem solving & deep comprehension",
    speed: "Standard",
    context: "128k"
  },
  {
    id: "llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    badge: "Fast & Smart",
    description: "Ultra-responsive powerhouse for versatile coding & dialogue",
    speed: "Ultra Fast",
    context: "128k"
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    badge: "Balanced",
    description: "Efficient MoE architecture for fast coding and tasks",
    speed: "Very Fast",
    context: "32k"
  }
];

export function ChatProvider({ children }) {
  const { user, showToast } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch threads when user or thread changes
  useEffect(() => {
    if (!user?.token) {
      setAllThreads([]);
      return;
    }

    const fetchThreads = async () => {
      setLoadingThreads(true);
      try {
        const threads = await chatApi.getThreads(user.token);
        setAllThreads(threads);
      } catch (err) {
        console.error('Error fetching threads:', err);
      } finally {
        setLoadingThreads(false);
      }
    };

    fetchThreads();
  }, [currThreadId, user?.token]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt('');
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setSidebarOpen(false);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setSidebarOpen(false);
    try {
      const messages = await chatApi.getThreadMessages(newThreadId, user.token);
      setPrevChats(messages);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error('Error switching thread:', err);
    }
  };

  const renameThread = async (threadId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await chatApi.renameThread(threadId, newTitle, user.token);
      setAllThreads(prev => prev.map(t => t.threadId === threadId ? { ...t, title: newTitle } : t));
      showToast("Conversation renamed");
    } catch (err) {
      console.error('Error renaming thread:', err);
      showToast("Failed to rename conversation");
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await chatApi.deleteThread(threadId, user.token);
      setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
      if (threadId === currThreadId) {
        createNewChat();
      }
      showToast("Conversation deleted");
    } catch (err) {
      console.error('Error deleting thread:', err);
    }
  };

  const clearAllHistory = async () => {
    try {
      await chatApi.clearAllThreads(user.token);
      setAllThreads([]);
      createNewChat();
      showToast("All conversations deleted");
    } catch (err) {
      console.error('Error clearing history:', err);
      showToast("Failed to clear history");
    }
  };

  const sendMessage = async (messageText) => {
    const textToSend = messageText || prompt;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setReply(null);
    setNewChat(false);

    try {
      const history = prevChats.map(c => ({ role: c.role, content: c.content }));
      const res = await chatApi.sendMessage({
        message: textToSend,
        threadId: currThreadId,
        history,
        model: selectedModel,
        token: user?.token,
      });

      setReply(res.reply);
    } catch (err) {
      console.error('Chat error:', err);
      setReply('Sorry, something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setCurrThreadId,
        prevChats,
        setPrevChats,
        newChat,
        setNewChat,
        allThreads,
        setAllThreads,
        sidebarOpen,
        setSidebarOpen,
        desktopSidebarOpen,
        setDesktopSidebarOpen,
        loading,
        loadingThreads,
        selectedModel,
        setSelectedModel,
        searchQuery,
        setSearchQuery,
        settingsOpen,
        setSettingsOpen,
        createNewChat,
        changeThread,
        renameThread,
        deleteThread,
        clearAllHistory,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
