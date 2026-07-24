import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext.jsx";
import "./Login.css";
import sigmaLogo from "./assets/sigmagpt-logo.svg";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser, showToast } = useContext(MyContext);

    const handleLogin = async () => {
        if (!email || !password) return setError("Please fill all fields");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.error) { setError(data.error); setLoading(false); return; }
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            setUser({ token: data.token, username: data.username });
            showToast("Welcome back! 👋");
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="authPage">
            <div className="authBox">
                <div className="authLogo">
                    <img src={sigmaLogo} alt="SigmaGPT logo" />
                </div>
                <h2>Welcome back</h2>
                <p className="authSubtitle">Log in to your SigmaGPT account</p>

                {error && <p className="authError">{error}</p>}

                <div className="authInputGroup">
                    <input
                        className="authInput"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="passwordWrapper">
                        <input
                            className="authInput"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" ? handleLogin() : ""}
                        />
                        <button
                            className="showHideBtn"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                    </div>
                </div>

                <button className="authBtn" onClick={handleLogin} disabled={loading}>
                    {loading ? <span className="authSpinner"></span> : "Log in"}
                </button>

                <p className="authSwitch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;