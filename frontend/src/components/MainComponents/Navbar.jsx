import api from "../../config/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, checkAuth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Compete", path: "/compete" },
    { label: "Rooms", path: "/rooms" },
    { label: "Achievements", path: "/achievements" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="h-16 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-[#1e1215] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 flex items-center justify-between h-full">
        {}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white text-sm group-hover:shadow-[0_0_16px_rgba(220,38,38,0.4)] transition-shadow">
            CB
          </div>
          <span className="text-lg font-bold text-[#e8e6e3] tracking-tight hidden sm:block">
            Code<span className="text-red-500">Breaker</span>
          </span>
        </div>

        {}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive(item.path)
                ? "bg-red-500/10 text-red-500 font-semibold"
                : "text-[#a8a29e] hover:text-[#e8e6e3] hover:bg-[#141118]"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#141118] transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#a8a29e] group-hover:text-[#e8e6e3] transition-colors">
                  {user.username}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-[#1e1215] text-[#6b6560] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="hidden md:block px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(220,38,38,0.3)]"
            >
              Login
            </button>
          )}

          {}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#a8a29e] hover:text-[#e8e6e3] rounded-lg hover:bg-[#141118] transition-all"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0d12] border-t border-[#1e1215] px-4 py-4 space-y-1 animate-in">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive(item.path)
                ? "bg-red-500/10 text-red-400"
                : "text-[#a8a29e] hover:text-[#e8e6e3] hover:bg-[#141118]"
                }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#1e1215] mt-3 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-[#a8a29e] hover:text-[#e8e6e3] hover:bg-[#141118] rounded-lg transition-all"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth");
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
