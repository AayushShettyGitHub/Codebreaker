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
      
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-4">
            <span className="text-white text-3xl font-bold">CB</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">CodeBreaker</h1>
          <p className="text-gray-600 mt-2">Solve. Compete. Conquer.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600 text-sm mb-8">Sign in to your account to continue</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 transition-colors" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 transition-colors" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <button 
                onClick={() => navigate("/auth?tab=signup")}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          Secure authentication with JWT • Your data is protected
        </p>
      </div>
    </div>
  );
}
