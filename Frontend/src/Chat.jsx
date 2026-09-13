import "./Chat.css";
import React, { useState, useEffect, useRef } from "react";
import { useChat } from "./context/ChatContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/github-dark.css";
import { OrbitalLoadingRing } from "./components/ui/OrbitalLoadingRing";
import { PromptSuggestions } from "./components/PromptSuggestions";

/* ── Enhanced Code Block with Language Badge ── */
function CodeBlock({ children, className, ...props }) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef(null);

    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "code";

    const handleCopy = () => {
        const text = preRef.current?.innerText || "";
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="codeBlockContainer">
            <div className="codeBlockHeader">
                <span className="codeLanguage">{language}</span>
                <button className="codeCopyBtn" onClick={handleCopy}>
                    {copied ? (
                        <>
                            <i className="fa-solid fa-check" style={{ color: "#4caf50" }}></i>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-regular fa-copy"></i>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre ref={preRef} className={className} {...props}>
                {children}
            </pre>
        </div>
    );
}

/* ── Table Component with Better Styling ── */
function Table({ children, ...props }) {
    return (
        <div className="tableWrapper">
            <table {...props}>
                {children}
            </table>
        </div>
    );
}

/* ── Table Header Component ── */
function TableHead({ children, ...props }) {
    return <thead {...props}>{children}</thead>;
}

/* ── Table Body Component ── */
function TableBody({ children, ...props }) {
    return <tbody {...props}>{children}</tbody>;
}

/* ── Table Row Component ── */
function TableRow({ children, ...props }) {
    return <tr {...props}>{children}</tr>;
}

/* ── Table Cell Component ── */
function TableCell({ children, isHeader, ...props }) {
    return isHeader ? (
        <th {...props}>{children}</th>
    ) : (
        <td {...props}>{children}</td>
    );
}

/* ── Message Action Buttons ── */
function MessageActions({ content, onRegenerate }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="messageActions">
            <button className="actionBtn" onClick={handleCopy} title="Copy message">
                {copied ? (
                    <i className="fa-solid fa-check" style={{ color: "#4caf50" }}></i>
                ) : (
                    <i className="fa-regular fa-copy"></i>
                )}
            </button>
            {onRegenerate && (
                <button className="actionBtn" onClick={onRegenerate} title="Regenerate response">
                    <i className="fa-solid fa-rotate-right"></i>
                </button>
            )}
        </div>
    );
}

const mdComponents = {
    pre: CodeBlock,
    table: Table,
    thead: TableHead,
    tbody: TableBody,
    tr: TableRow,
    th: ({ children, ...props }) => <th {...props}>{children}</th>,
    td: ({ children, ...props }) => <td {...props}>{children}</td>,
};

function Chat() {
    const { newChat, prevChats, reply, loading, sendMessage, setPrompt } = useChat();

    const [latestReply, setLatestReply] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);

    const chatsContainerRef = useRef(null);
    const bottomRef = useRef(null);

    /* ── Detect scroll position ── */
    const handleScroll = () => {
        if (!chatsContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatsContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        setShowScrollBottom(!isNearBottom);
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /* ── Auto-scroll to bottom on new messages ── */
    useEffect(() => {
        if (!showScrollBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [prevChats, latestReply, loading]);

    /* ── Animate typing effect ── */
    useEffect(() => {
        if (!reply) {
            setLatestReply(null);
            setIsTyping(false);
            return;
        }

        const words = reply.split(" ");
        let idx = 0;
        setLatestReply("");
        setIsTyping(true);

        const interval = setInterval(() => {
            setLatestReply(words.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= words.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 25);

        return () => clearInterval(interval);
    }, [reply]);

    const handleSelectPrompt = (selectedText) => {
        setPrompt(selectedText);
        sendMessage(selectedText);
    };

    const handleRegenerate = () => {
        if (loading || prevChats.length === 0) return;
        const lastUserMsg = [...prevChats].reverse().find(m => m.role === "user");
        if (lastUserMsg) {
            sendMessage(lastUserMsg.content);
        }
    };

    const hasMessages = prevChats.length > 0 || latestReply !== null || loading;

    return (
        <div className="chats" ref={chatsContainerRef} onScroll={handleScroll}>
            {!hasMessages && newChat ? (
                <PromptSuggestions onSelectPrompt={handleSelectPrompt} />
            ) : (
                <>
                    {/* ── Display all historical messages ── */}
                    {prevChats?.slice(0, reply ? -2 : undefined).map((chat, idx) => (
                        <div
                            className={chat.role === "user" ? "userDiv" : "gptDiv"}
                            key={idx}
                        >
                            {chat.role === "user" ? (
                                <p className="userMessage">{chat.content}</p>
                            ) : (
                                <>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        components={mdComponents}
                                    >
                                        {chat.content}
                                    </ReactMarkdown>
                                    <MessageActions
                                        content={chat.content}
                                        onRegenerate={idx === prevChats.length - 1 ? handleRegenerate : null}
                                    />
                                </>
                            )}
                        </div>
                    ))}

                    {/* ── User message that triggered ongoing AI reply ── */}
                    {prevChats?.length >= 2 && reply && (
                        <div className="userDiv">
                            <p className="userMessage">
                                {prevChats[prevChats.length - 2].content}
                            </p>
                        </div>
                    )}

                    {/* ── AI Loading State ── */}
                    {loading && (
                        <div className="gptDiv loadingMessage">
                            <OrbitalLoadingRing size={48} speed={1} />
                        </div>
                    )}

                    {/* ── Live AI Response with Typing Animation ── */}
                    {!loading && latestReply !== null && (
                        <div className="gptDiv" key="typing">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={mdComponents}
                            >
                                {latestReply}
                            </ReactMarkdown>
                            {isTyping && <span className="typingCursor" />}
                            {!isTyping && (
                                <MessageActions
                                    content={latestReply}
                                    onRegenerate={handleRegenerate}
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── Floating Scroll to Bottom Button ── */}
            {showScrollBottom && (
                <button
                    className="scrollToBottomBtn"
                    onClick={scrollToBottom}
                    aria-label="Scroll to bottom"
                >
                    <i className="fa-solid fa-arrow-down"></i>
                </button>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

export default Chat;
