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
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => navigate("/")}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <span className="text-white text-xl font-bold">CB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CodeBreaker</span>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => handleTabSwitch("login")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              showLogin
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabSwitch("signup")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              !showLogin
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        {showLogin ? <Login /> : <Signup />}
      </div>
    </div>
  );
}
