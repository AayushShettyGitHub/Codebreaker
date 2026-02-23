import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  async function handleLogin(e) {
    e?.preventDefault();
    if (!username || !password) {
      setError("Both fields are required");
      toastError("Both fields are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/login", { username, password });
      toastSuccess("Login successful!");

      await new Promise((resolve) => setTimeout(resolve, 500));
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
    <form onSubmit={handleLogin} className="w-full space-y-5">
      <div>
        <label className="block text-xs font-medium text-[#a8a29e] mb-2">
          Username
        </label>
        <input
          className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a8a29e] mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            className="w-full px-4 py-3 pr-11 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44403c] hover:text-[#a8a29e] transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all disabled:opacity-40 hover:shadow-[0_4px_20px_rgba(220,38,38,0.3)]"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </form>
  );
}
