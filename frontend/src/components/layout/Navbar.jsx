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
    <header className="h-16 bg-[#09090b]/95 backdrop-blur-md border-b border-[#1c1c22] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between h-full">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-sm group-hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] transition-shadow">
            CB
          </div>
          <span className="text-lg font-bold text-[#e4e4e7] tracking-tight hidden sm:block">
            Code<span className="text-indigo-400">Breaker</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive(item.path)
                ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                : "text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#141419]"
                }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[#141419] transition-all group"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7] transition-colors">
                  {user.username}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-[#1c1c22] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#27272a] hover:bg-[#141419] text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="hidden md:block px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
            >
              Login
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#a1a1aa] hover:text-[#e4e4e7] rounded-lg hover:bg-[#141419] transition-all"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0f13] border-t border-[#1c1c22] px-4 py-4 space-y-1 animate-in">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all ${isActive(item.path)
                ? "bg-indigo-500/10 text-indigo-400"
                : "text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#141419]"
                }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#1c1c22] mt-3 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#141419] rounded-lg transition-all"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#141419] rounded-lg transition-all"
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
                className="w-full px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
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
