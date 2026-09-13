import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { authApi } from "./services/api";
import "./Login.css";
import sigmaLogo from "./assets/sigmagpt-logo.svg";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { loginUser, showToast } = useAuth();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        if (!email || !password) return setError("Please fill all fields");
        setLoading(true);
        setError("");
        try {
            const data = await authApi.login(email, password);
            loginUser(data.token, data.username);
            showToast(`Welcome back, ${data.username}! 👋`);
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
                <h2>Welcome back</h2>
                <p className="authSubtitle">Log in to your SigmaGPT account</p>

                {error && <div className="authError">{error}</div>}

                <form className="authInputGroup" onSubmit={handleLogin}>
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
                            placeholder="Password"
                            value={password}
                            autoComplete="current-password"
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
                        {loading ? <span className="authSpinner"></span> : "Log in"}
                    </button>
                </form>

                <p className="authSwitch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
