import { useState } from "react";
import api from "../../config/client";

export default function Signup({ onSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup() {
  if (!username || !password) {
    setError("Both fields are required");
    return;
  }

  try {
    await api.post("/auth/signup", { username, password });
    setError("");
    onSignup(); // triggers switch to login
  } catch (err) {
    setError(err.response?.data || "Signup failed");
  }
}


  return (
    <div>
      <h3>Signup</h3>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleSignup}>Signup</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
