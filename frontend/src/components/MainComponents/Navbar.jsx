import api from "../../config/client";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await api.post("/auth/logout", {});
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 text-white shadow-lg">
      <div className="container flex items-center justify-between py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-slate-900">CB</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">CodeBreaker</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-slate-300">Welcome, <span className="font-semibold text-sky-400">{user.username}</span></span>}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
