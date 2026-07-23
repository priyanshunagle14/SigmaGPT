import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";
import sigmaLogo from "./assets/sigmagpt-logo.svg";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, user } = useContext(MyContext);
    const navigate = useNavigate();

    const getAllThreads = async () => {
        if (!user?.token) return; // guest - don't fetch
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/thread`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            const res = await response.json();
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, user]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${newThreadId}`, {
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/thread/${threadId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${user.token}` }
            });
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) createNewChat();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className="sidebar">
            <button onClick={createNewChat}>
                <img src={sigmaLogo} alt="gpt logo" />
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>

            {!user?.token ? (
                <div className="guestMessage">
                    <p>Log in to save your chats</p>
                    <button className="loginBtn" onClick={() => navigate("/login")}>Log in</button>
                    <button className="signupBtn" onClick={() => navigate("/signup")}>Sign up</button>
                </div>
            ) : (
                <ul className="history">
                    {allThreads?.map((thread, idx) => (
                        <li key={idx}
                            onClick={() => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted" : ""}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))}
                </ul>
            )}

            <div className="sign">
                <p>By Priyanshu Nagle &hearts;</p>
            </div>
        </section>
    );
}

export default Sidebar;