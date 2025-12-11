import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import googleLogo from "../assets/logos/google.svg";
import microsoftLogo from "../assets/logos/microsoft.svg";
import githubLogo from "../assets/logos/github.svg";
import { useDispatch } from "react-redux";
import { login, setMessage } from "../redux/authslice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      dispatch(login({ user: data.user, token: data.token }));
      dispatch(setMessage({ type: "success", text: "Login successful!" }));
      navigate("/projectspage");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred.");
      dispatch(setMessage({ type: "error", text: err.message || "Login failed." }));
    }
  };

  return (
    <div className="login-grid">
      <div className="login-container">
        <h1>Login</h1>
        <p>Welcome Back, Enter Your Details</p>

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label htmlFor="login-email">Your Email</label>
            <div className="input-wrapper">
              <input
                id="login-email"
                type="email"
                placeholder="e.g: username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FontAwesomeIcon icon={faUserCircle} />
            </div>
          </div>

          <div className="input-field">
            <label htmlFor="login-password">Your Password</label>
            <div className="input-wrapper">
              <input
                id="login-password"
                type="password"
                placeholder="username@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FontAwesomeIcon icon={faKey} />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>

        <div className="add-info">
          <p>
            Don't have an account?
            <span>
              <Link to="/signup">Signup</Link>
            </span>
          </p>
        </div>

        <div className="links">
          <p>Continue With</p>
          <hr />
          <div className="logos">
            <img src={googleLogo} alt="Google" />
            <img src={githubLogo} alt="Github" />
            <img src={microsoftLogo} alt="Microsoft" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;