import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  async function handleSignup(e) {
    e?.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      toastError("All fields are required");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      toastError("Username must be at least 3 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toastError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      toastError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", { username, password });
      toastSuccess("Account created!");

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
        setError("Signup failed");
        toastError("Signup failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignup} className="w-full space-y-5">
      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
          Username
        </label>
        <input
          className="w-full px-4 py-3 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-[#3f3f46]"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          autoComplete="username"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            className="w-full px-4 py-3 pr-11 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-[#3f3f46]"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3f3f46] hover:text-[#a1a1aa] transition-colors"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-2">
          Confirm Password
        </label>
        <input
          type={showPw ? "text" : "password"}
          className="w-full px-4 py-3 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-[#3f3f46]"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-40 hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </form>
  );
}
