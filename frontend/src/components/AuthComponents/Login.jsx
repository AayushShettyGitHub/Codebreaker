import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    if (!username || !password) return setError("Both fields are required");

    try {
      await api.post("/auth/login", { username, password });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Login to CodeBreaker</h2>
      <div className="space-y-4">
        <input 
          className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button 
          onClick={handleLogin}
          className="w-full py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all"
        >
          Login
        </button>
      </div>
      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
