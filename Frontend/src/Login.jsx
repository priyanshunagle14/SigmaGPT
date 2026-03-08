import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext.jsx";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser, showToast } = useContext(MyContext);

    const handleLogin = async () => {
    if (!email || !password) return setError("Please fill all fields");
    try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.error) return setError(data.error);
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        setUser({ token: data.token, username: data.username });
        showToast("Welcome back! 👋");
        navigate("/");
    } catch (err) {
        console.error("Login error:", err);
        setError("Something went wrong");
    }
};
    return (
        <div className="authPage">
            <div className="authBox">
                <div className="authLogo">
                    <img src="/src/assets/sigmagpt-logo.svg" alt="SigmaGPT" className="authLogoImg" />
                </div>
                <h2>Welcome back</h2>
                <p className="authSubtitle">Log in to your SigmaGPT account</p>

                {error && <p className="authError">{error}</p>}

                <div className="authInputGroup">
                    <input className="authInput" type="email" placeholder="Email address"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="authInput" type="password" placeholder="Password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? handleLogin() : ""} />
                </div>

                <button className="authBtn" onClick={handleLogin}>Log in</button>

                <p className="authSwitch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;