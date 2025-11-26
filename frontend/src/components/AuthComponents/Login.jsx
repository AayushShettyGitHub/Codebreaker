import { useState } from "react";
import api from "../../config/client";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");

  async function handleLogin() {
    const res = await api.post("/players/login", { name });
    onLogin(res.data.id);
  }

  return (
    <div>
      <h3>Login</h3>
      <input
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
