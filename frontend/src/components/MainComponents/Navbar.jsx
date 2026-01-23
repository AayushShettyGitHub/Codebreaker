import api from "../../config/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const { setUser, checkAuth } = useAuth();

  async function handleLogout() {
    try {
      await api.post("/auth/logout", {});
      setUser(null);
      await checkAuth();
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
      <div className="container max-w-7xl flex items-center justify-between py-4 px-6 mx-auto">
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center font-bold text-white">CB</div>
          <h1 className="text-2xl font-bold text-gray-900">CodeBreaker</h1>
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => navigate("/")}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </button>
            <button 
              onClick={() => navigate("/about")}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              About
            </button>
            <button 
              onClick={() => navigate("/compete")}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Compete
            </button>
            <button 
              onClick={() => navigate("/leaderboard")}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Leaderboard
            </button>
          </nav>

          {user ? (
            <div className="flex items-center gap-4 border-l border-gray-200 pl-8">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">{user.username}</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium text-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
