import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useAuth } from "./context/AuthContext";
import { useChat } from "./context/ChatContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
    const { user, logoutUser, toast } = useAuth();
    const {
        prompt,
        setPrompt,
        reply,
        loading,
        sendMessage,
        setPrevChats,
        setSidebarOpen
    } = useChat();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const textareaRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    // Append newly completed message to history
    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: prompt },
                { role: "assistant", content: reply }
            ]);
            setPrompt("");
        }
    }, [reply]);

    const handleSend = () => {
        if (!prompt.trim() || loading) return;
        sendMessage(prompt);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    return (
        <div className="chatWindow">
            {toast && <div className="toast">{toast}</div>}

            <header className="navbar">
                <button
                    className="menuBtn"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                <div className="brandBadge">
                    <span>SigmaGPT</span>
                    <span className="modelTag">GPT-OSS 120B</span>
                </div>

                <div className="userMenuWrapper" ref={dropdownRef}>
                    <div
                        className="userIconDiv"
                        onClick={() => setDropdownOpen(prev => !prev)}
                    >
                        <span className="userIcon">
                            {user?.username ? user.username[0].toUpperCase() : <i className="fa-solid fa-user"></i>}
                        </span>
                    </div>

                    {dropdownOpen && (
                        <div className="dropDown">
                            {user?.token ? (
                                <>
                                    <div className="dropDownUserHeader">
                                        <p className="dropDownUsername">{user.username}</p>
                                        <p className="dropDownStatus">Active Account</p>
                                    </div>
                                    <div className="dropDownDivider" />
                                    <div
                                        className="dropDownItem logoutItem"
                                        onClick={() => {
                                            logoutUser();
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                        <span>Log out</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className="dropDownItem"
                                        onClick={() => {
                                            navigate("/login");
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-right-to-bracket"></i>
                                        <span>Log in</span>
                                    </div>

                                    <div
                                        className="dropDownItem"
                                        onClick={() => {
                                            navigate("/signup");
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        <i className="fa-solid fa-user-plus"></i>
                                        <span>Sign up</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <Chat />

            <div className="chatInput">
                <div className="inputBox">
                    <textarea
                        ref={textareaRef}
                        className="promptTextarea"
                        placeholder={loading ? "SigmaGPT is thinking..." : "Message SigmaGPT..."}
                        value={prompt}
                        disabled={loading}
                        rows={1}
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            const ta = textareaRef.current;
                            if (ta) {
                                ta.style.height = "auto";
                                ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    <button
                        id="submit"
                        type="button"
                        onClick={handleSend}
                        disabled={loading || !prompt.trim()}
                        className={loading || !prompt.trim() ? "disabledSubmit" : ""}
                        aria-label="Send message"
                    >
                        <i className="fa-solid fa-arrow-up"></i>
                    </button>
                </div>

                <p className="info">
                    SigmaGPT can produce inaccurate information. Verify critical details independently.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;
