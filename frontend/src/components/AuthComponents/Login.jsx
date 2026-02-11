import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  async function handleLogin() {
    if (!username || !password) {
      setError("Both fields are required");
      toastError("Both fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/login", { username, password });
      toastSuccess("Login successful!");

      await new Promise(resolve => setTimeout(resolve, 500));
      
      await checkAuth();
      
      navigate("/compete", { replace: true });
    } catch (err) {
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        const msg = getErrorMessage(err);
        setError(msg);
        toastError(msg);
      } catch (e) {
        setError("Login failed");
        toastError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="Enter your username (min 3 chars)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="Enter your password (min 6 chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
