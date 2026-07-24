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
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser, showToast } = useContext(MyContext);

    const handleSignup = async () => {
        if (!username || !email || !password) return setError("Please fill all fields");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.error) { setError(data.error); setLoading(false); return; }
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            setUser({ token: data.token, username: data.username });
            showToast(`Welcome to SigmaGPT, ${data.username}! 🎉`);
            navigate("/");
        } catch (err) {
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
                <h2>Create account</h2>
                <p className="authSubtitle">Sign up for SigmaGPT</p>

                {error && <p className="authError">{error}</p>}

                <div className="authInputGroup">
                    <input
                        className="authInput"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
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
                            onKeyDown={(e) => e.key === "Enter" ? handleSignup() : ""}
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

                <button className="authBtn" onClick={handleSignup} disabled={loading}>
                    {loading ? <span className="authSpinner"></span> : "Sign up"}
                </button>

                <p className="authSwitch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;