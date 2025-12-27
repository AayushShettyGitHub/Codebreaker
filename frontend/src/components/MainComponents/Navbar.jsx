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
    <header className="bg-indigo-600 text-white">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded flex items-center justify-center font-bold">CB</div>
          <h1 className="text-xl font-semibold">CodeBreaker</h1>
        </div>

        <div className="flex items-center gap-4">
          {user && <span className="text-sm">Hi, <span className="font-medium">{user.username}</span></span>}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-white text-red-600 rounded-md font-medium hover:bg-white/90"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
