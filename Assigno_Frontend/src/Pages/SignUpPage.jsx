import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import googleLogo from "../assets/logos/google.svg";
import microsoftLogo from "../assets/logos/microsoft.svg";
import githubLogo from "../assets/logos/github.svg";
import { useDispatch } from "react-redux";
import { setMessage } from "../redux/authslice";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      dispatch(setMessage({ type: "error", text: "Passwords do not match." }));
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      dispatch(
        setMessage({
          type: "success",
          text: "Registration successful! You can now log in.",
        })
      );
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An unexpected error occurred during signup.");
      dispatch(
        setMessage({ type: "error", text: err.message || "Signup failed." })
      );
    }
  };

  return (
    <div className="login-grid">
      <div className="login-container">
        <h1>Sign Up</h1>
        <p>Create an account and rely on Assigno</p>

        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label htmlFor="signup-name">Your Username</label>
            <div className="input-wrapper">
              <input
                id="signup-name"
                type="text"
                placeholder="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-field">
            <label htmlFor="signup-email">Your Email</label>
            <div className="input-wrapper">
              <input
                id="signup-email"
                type="email"
                placeholder="e.g: username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-field">
            <label htmlFor="signup-password">Create Password</label>
            <div className="input-wrapper">
              <input
                id="signup-password"
                type="password"
                placeholder="username@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-field">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="signup-confirm-password"
                type="password"
                placeholder="username@123"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Sign Up</button>

          <div className="add-info">
            <p>
              Already have an account?
              <span>
                <Link to="/login">Login</Link>
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
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;