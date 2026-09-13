import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { authApi } from "./services/api";
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
    const { loginUser, showToast } = useAuth();

    const handleSignup = async (e) => {
        if (e) e.preventDefault();
        if (!username.trim() || !email.trim() || !password) {
            return setError("Please fill all fields");
        }
        if (username.trim().length < 3) {
            return setError("Username must be at least 3 characters");
        }
        if (password.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        setLoading(true);
        setError("");
        try {
            const data = await authApi.register(username.trim(), email.trim(), password);
            loginUser(data.token, data.username);
            showToast(`Welcome to SigmaGPT, ${data.username}! 🎉`);
            navigate("/");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authPage">
            <div className="authBox">
                <div className="authLogo">
                    <img src={sigmaLogo} alt="SigmaGPT" />
                </div>
                <h2>Create account</h2>
                <p className="authSubtitle">Sign up to get started with SigmaGPT</p>

                {error && <div className="authError">{error}</div>}

                <form className="authInputGroup" onSubmit={handleSignup}>
                    <input
                        className="authInput"
                        type="text"
                        placeholder="Username (min 3 chars)"
                        value={username}
                        autoComplete="username"
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="authInput"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        autoComplete="email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="passwordWrapper">
                        <input
                            className="authInput"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (min 6 chars)"
                            value={password}
                            autoComplete="new-password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="showHideBtn"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                        </button>
                    </div>

                    <button className="authBtn" type="submit" disabled={loading}>
                        {loading ? <span className="authSpinner"></span> : "Sign up"}
                    </button>
                </form>

                <p className="authSwitch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
