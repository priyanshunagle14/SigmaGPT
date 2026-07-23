import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext.jsx";
import "./Login.css";
import sigmaLogo from "./assets/sigmagpt-logo.svg";

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser, showToast } = useContext(MyContext);

    const handleSignup = async () => {
        if (!username || !email || !password) return setError("Please fill all fields");
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.error) return setError(data.error);
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            setUser({ token: data.token, username: data.username });
            showToast(`Welcome to SigmaGPT, ${data.username}! 🎉`);
            navigate("/");
        } catch (err) {
            setError("Something went wrong");
        }
    };

    return (
        <div className="authPage">
            <div className="authBox">
                <div className="authLogo">
                    <img src={sigmaLogo} alt="gpt logo" />
                </div>
                <h2>Create account</h2>
                <p className="authSubtitle">Sign up for SigmaGPT</p>

                {error && <p className="authError">{error}</p>}

                <div className="authInputGroup">
                    <input className="authInput" type="text" placeholder="Username"
                        value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input className="authInput" type="email" placeholder="Email address"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="authInput" type="password" placeholder="Password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? handleSignup() : ""} />
                </div>

                <button className="authBtn" onClick={handleSignup}>Sign up</button>

                <p className="authSwitch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;