import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, setPrevChats, setNewChat, user, setUser, toast, showToast, setAllThreads } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const getReply = async () => {
        setLoading(true);
        setNewChat(false);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(user?.token && { "Authorization": `Bearer ${user.token}` })
            },
            body: JSON.stringify({ message: prompt, threadId: currThreadId })
        };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, options);
            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => ([
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]));
        }
        setPrompt("");
    }, [reply]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setUser({ token: null, username: null });
        setIsOpen(false);
        showToast("You're logged out 👋");
        setPrevChats([]);
        setAllThreads([]);
        setNewChat(true);
    };

    return (
        <div className="chatWindow">
            {toast && <div className="toast">{toast}</div>}

            <div className="navbar">
                <span>SigmaGPT <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
                    <span className="userIcon"><i className="fa-solid fa-user"></i></span>
                </div>
            </div>

            {isOpen &&
                <div className="dropDown">
                    {user?.token ? (
                        <>
                            <div className="dropDownItem"><i className="fa-solid fa-user"></i> {user.username}</div>
                            <div className="dropDownItem"><i className="fa-solid fa-gear"></i> Settings</div>
                            <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
                        </>
                    ) : (
                        <>
                            <div className="dropDownItem" onClick={() => { navigate("/login"); setIsOpen(false); }}><i className="fa-solid fa-arrow-right-to-bracket"></i> Log in</div>
                            <div className="dropDownItem" onClick={() => { navigate("/signup"); setIsOpen(false); }}><i className="fa-solid fa-user-plus"></i> Sign up</div>
                        </>
                    )}
                </div>
            }

            <Chat />
            <ScaleLoader color="#fff" loading={loading} />

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        placeholder="Ask anything"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' ? getReply() : ''}
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
                <p className="info">
                    SigmaGPT can make mistakes. Check important info. See Cookie Preferences.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;