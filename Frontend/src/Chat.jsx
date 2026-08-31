import "./Chat.css";
import React, {
    useContext,
    useState,
    useEffect,
    useRef
} from "react";

import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { OrbitalLoadingRing } from "./components/ui/OrbitalLoadingRing";

/* ── Copy-button wrapper around every <pre> code block ── */

function CodeBlock({ children, ...props }) {
    const [copied, setCopied] = useState(false);
    const preRef = useRef(null);

    const handleCopy = () => {
        const text = preRef.current?.innerText || "";

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    };

    return (
        <div className="codeWrapper">

            <button
                className="copyBtn"
                onClick={handleCopy}
            >
                {copied ? (
                    <>
                        <i className="fa-solid fa-check"></i>
                        Copied!
                    </>
                ) : (
                    <>
                        <i className="fa-regular fa-copy"></i>
                        Copy
                    </>
                )}
            </button>

            <pre ref={preRef} {...props}>
                {children}
            </pre>

        </div>
    );
}

const mdComponents = {
    pre: CodeBlock
};

function Chat({ loading }) {

    const {
        newChat,
        prevChats,
        reply
    } = useContext(MyContext);

    const [latestReply, setLatestReply] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const bottomRef = useRef(null);

    /* ── Auto-scroll ── */

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [
        prevChats,
        latestReply,
        loading
    ]);

    /* ── Type AI response ── */

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

            setLatestReply(
                words
                    .slice(0, idx + 1)
                    .join(" ")
            );

            idx++;

            if (idx >= words.length) {

                clearInterval(interval);

                setIsTyping(false);
            }

        }, 40);

        return () => {
            clearInterval(interval);
        };

    }, [reply]);

    return (
        <>
            {newChat && (
                <h1>Start a New Chat!</h1>
            )}

            <div className="chats">

                {/* ── Previous messages ── */}

                {prevChats?.slice(0, -2).map(
                    (chat, idx) => (

                        <div
                            className={
                                chat.role === "user"
                                    ? "userDiv"
                                    : "gptDiv"
                            }
                            key={idx}
                        >

                            {chat.role === "user" ? (

                                <p className="userMessage">
                                    {chat.content}
                                </p>

                            ) : (

                                <ReactMarkdown
                                    rehypePlugins={[
                                        rehypeHighlight
                                    ]}
                                    components={
                                        mdComponents
                                    }
                                >
                                    {chat.content}
                                </ReactMarkdown>

                            )}

                        </div>
                    )
                )}

                {/* ── Current user message ── */}

                {prevChats?.length >= 2 && (

                    <div className="userDiv">

                        <p className="userMessage">
                            {
                                prevChats[
                                    prevChats.length - 2
                                ].content
                            }
                        </p>

                    </div>

                )}

                {/* ── Loading animation ── */}

                {loading && (

                    <div className="gptDiv loadingMessage">

                        <OrbitalLoadingRing
                            size={42}
                            speed={1.2}
                            variant="minimal"
                            label="SigmaGPT is thinking"
                        />

                    </div>

                )}

                {/* ── AI response ── */}

                {!loading &&
                    latestReply !== null && (

                        <div
                            className="gptDiv"
                            key="typing"
                        >

                            <ReactMarkdown
                                rehypePlugins={[
                                    rehypeHighlight
                                ]}
                                components={
                                    mdComponents
                                }
                            >
                                {latestReply}
                            </ReactMarkdown>

                            {isTyping && (
                                <span className="typingCursor" />
                            )}

                        </div>
                    )}

                <div ref={bottomRef} />

            </div>
        </>
    );
}

export default Chat;