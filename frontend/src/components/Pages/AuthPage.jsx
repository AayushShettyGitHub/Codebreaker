import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Signup from "../AuthComponents/Signup";
import Login from "../AuthComponents/Login";

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get("tab") !== "signup");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
              <span className="text-white text-xl font-bold">CB</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CodeBreaker</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Features</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">About</button>
            <button className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Contact</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Compete & 
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Conquer</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            CodeBreaker is a competitive coding platform where developers test their skills in real-time coding challenges. Compete with others, solve problems, and earn your place on the leaderboard.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="text-gray-700">Real-time multiplayer competitions</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="text-gray-700">Multiple programming languages</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="text-gray-700">Live leaderboards & rankings</p>
            </div>
          </div>

          <button 
            onClick={() => setShowLogin(false)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Get Started →
          </button>
        </div>

        <div>
          {showLogin ? <Login /> : <Signup />}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose CodeBreaker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Instant code execution and real-time results with WebSocket synchronization</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive</h3>
              <p className="text-gray-600">Compete with other developers and track your progress on live leaderboards</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">JWT authentication with HttpOnly cookies for maximum security</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">&copy; 2026 CodeBreaker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
