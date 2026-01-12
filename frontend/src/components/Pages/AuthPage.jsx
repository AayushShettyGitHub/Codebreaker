import { useState } from "react";
import Signup from "../AuthComponents/Signup";
import Login from "../AuthComponents/Login";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl mb-6">
          <span className="text-4xl font-bold text-slate-950">⚡</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">CodeBreaker</h1>
        <p className="text-slate-400">Competitive Coding Platform</p>
      </div>

      <div className="w-full max-w-md mb-8">
        {showLogin ? <Login /> : <Signup onSignup={() => setShowLogin(true)} />}
      </div>

      <button
        onClick={() => setShowLogin(!showLogin)}
        className="text-slate-400 hover:text-blue-400 transition-colors font-medium"
      >
        {showLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
      </button>
    </div>
  );
}
