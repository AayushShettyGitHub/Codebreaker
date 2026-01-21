import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";

export default function Signup({ onSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
  if (!username || !password) {
    setError("Both fields are required");
    toastError("Both fields are required");
    return;
  }

  try {
    await api.post("/auth/signup", { username, password });
    await api.post("/auth/login", { username, password });
    toastSuccess("Signup successful!");
    navigate("/home");
  } catch (err) {
    const msg = err.response?.data || "Signup failed";
    setError(msg);
    toastError(msg);
  }
}


  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 max-w-md">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Create Account</h2>

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
          onClick={handleSignup}
          className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all"
        >
          Sign Up
        </button>
      </div>

      {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
    </div>
  );
}
