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
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
      {}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md animate-in">
          {}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 mb-5 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <span className="text-white text-xl font-bold">CB</span>
            </div>
            <h2 className="text-2xl font-bold text-[#e8e6e3] mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-[#6b6560]">
              Sign in to your account to continue
            </p>
          </div>

          {}
          <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-8 shadow-2xl">
            {}
            <div className="flex gap-1 mb-8 p-1 bg-[#141118] rounded-lg">
              <button
                onClick={() => handleTabSwitch("login")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${showLogin
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[#6b6560] hover:text-[#a8a29e]"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => handleTabSwitch("signup")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${!showLogin
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[#6b6560] hover:text-[#a8a29e]"
                  }`}
              >
                Register
              </button>
            </div>

            <div className="animate-in" key={showLogin ? "login" : "signup"}>
              {showLogin ? <Login /> : <Signup />}
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-[#44403c] hover:text-red-400 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
