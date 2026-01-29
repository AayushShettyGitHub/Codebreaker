import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Signup from "../AuthComponents/Signup";
import Login from "../AuthComponents/Login";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get("tab") !== "signup");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/compete", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setShowLogin(searchParams.get("tab") !== "signup");
  }, [searchParams]);

  const handleTabSwitch = (tab) => {
    if (tab === "signup") {
      navigate("/auth?tab=signup");
      setShowLogin(false);
    } else {
      navigate("/auth");
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate("/")}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
              <span className="text-white text-xl font-bold">CB</span>
            </div>
            <span className="text-xl font-bold text-slate-900">CodeBreaker</span>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-20 min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to CodeBreaker</h2>
            <p className="text-slate-600 text-sm mt-2">Join the competitive coding revolution</p>
          </div>
          <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => handleTabSwitch("login")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              showLogin
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabSwitch("signup")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              !showLogin
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign Up
          </button>
        </div>

          {showLogin ? <Login /> : <Signup />}
        </div>
      </div>
    </div>
  );
}
