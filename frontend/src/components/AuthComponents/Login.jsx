import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    if (!username || !password) {
      setError("Both fields are required");
      toastError("Both fields are required");
      return;
    }

    try {
      await api.post("/auth/login", { username, password });
      toastSuccess("Login successful!");
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toastError(msg);
    }
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-lg border border-slate-700/60 rounded-2xl p-8 max-w-md shadow-2xl">
      <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">Login to CodeBreaker</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Username</label>
          <input 
            className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-white placeholder-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:bg-slate-900 transition-all" 
            placeholder="Enter your username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
          <input 
            type="password" 
            className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-800/50 text-white placeholder-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:bg-slate-900 transition-all" 
            placeholder="Enter your password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button 
          onClick={handleLogin}
          className="w-full py-3 bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-slate-500/50 transform hover:scale-105 active:scale-100"
        >
          Sign In
        </button>
      </div>
      {error && <p className="mt-6 text-red-400 text-sm font-medium bg-red-600/10 p-3 rounded-lg border border-red-600/30">{error}</p>}
    </div>
  );
}
