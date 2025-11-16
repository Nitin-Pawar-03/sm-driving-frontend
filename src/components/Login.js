import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Login.css";

const BACKEND_URL = "https://sm-driving-backend.onrender.com";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Invalid username or password");
        return;
      }

      // Backend returns { access_token, token_type }, but we don't need to store it now.
      await response.json();

      // Mark user as logged in in your context
      login();

      // Redirect to Admin page
      navigate("/admin");
    } catch (err) {
      console.error("Error logging in:", err);
      setError("Error logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "10px", width: "200px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", width: "200px" }}
          />
        </div>
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "15px", padding: "10px 20px" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default Login;
