import "./Sidebar.css";
import React from "react";
import { useAuth } from "./context/AuthContext";
import { useChat } from "./context/ChatContext";
import { useNavigate } from "react-router-dom";
import sigmaLogo from "./assets/sigmagpt-logo.svg";

function Sidebar() {
    const { user } = useAuth();
    const {
        allThreads,
        currThreadId,
        sidebarOpen,
        setSidebarOpen,
        createNewChat,
        changeThread,
        deleteThread,
        loadingThreads,
    } = useChat();
    const navigate = useNavigate();

    return (
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebarHeader">
                <div className="sidebarBrand">
                    <img src={sigmaLogo} alt="SigmaGPT" className="sidebarLogo" />
                    <span className="brandTitle">SigmaGPT</span>
                </div>
                <button
                    className="newChatBtn"
                    onClick={createNewChat}
                    title="New chat"
                >
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            </div>

            {!user?.token ? (
                <div className="guestMessage">
                    <div className="guestCard">
                        <i className="fa-solid fa-cloud-arrow-up guestIcon"></i>
                        <h4>Save your conversation history</h4>
                        <p>Sign in to sync your chats across devices and access previous conversations.</p>
                        <div className="guestActions">
                            <button className="loginBtn" onClick={() => navigate("/login")}>
                                Log in
                            </button>
                            <button className="signupBtn" onClick={() => navigate("/signup")}>
                                Sign up
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="historySection">
                    <span className="historyHeading">Recent Chats</span>
                    {loadingThreads ? (
                        <div className="historyLoading">
                            <div className="skeletonRow"></div>
                            <div className="skeletonRow short"></div>
                            <div className="skeletonRow"></div>
                        </div>
                    ) : allThreads?.length === 0 ? (
                        <div className="emptyHistory">
                            <p>No previous chats</p>
                        </div>
                    ) : (
                        <ul className="history">
                            {allThreads.map((thread) => (
                                <li
                                    key={thread.threadId}
                                    onClick={() => changeThread(thread.threadId)}
                                    className={thread.threadId === currThreadId ? "highlighted" : ""}
                                    title={thread.title}
                                >
                                    <i className="fa-regular fa-message threadIcon"></i>
                                    <span className="threadTitle">{thread.title}</span>
                                    <button
                                        className="deleteBtn"
                                        aria-label="Delete chat"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteThread(thread.threadId);
                                        }}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className="sidebarFooter">
                {user?.token ? (
                    <div className="userProfileCard">
                        <div className="userAvatar">
                            {user.username ? user.username[0].toUpperCase() : "U"}
                        </div>
                        <div className="userInfo">
                            <span className="profileUsername">{user.username}</span>
                            <span className="profileTier">Free Plan</span>
                        </div>
                    </div>
                ) : (
                    <div className="footerAttribution">
                        <span>Powered by Groq LLMs</span>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
