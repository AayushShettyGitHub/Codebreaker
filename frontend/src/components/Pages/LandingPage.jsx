import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Master Competitive Programming</h1>
            <p className="text-xl text-gray-600 mb-8">
              Real-time coding competitions with instant feedback, leaderboards, and community challenges. Level up your coding skills today.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(user ? "/home" : "/auth")}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {user ? "Go to Compete" : "Get Started"}
              </button>
              <button
                onClick={() => navigate("/about")}
                className="px-8 py-3 border-2 border-gray-300 hover:border-blue-600 text-gray-900 hover:text-blue-600 rounded-lg font-semibold transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: "⚡", title: "Lightning Fast", desc: "Real-time updates keep everyone in sync" },
            { icon: "🏆", title: "Competitive", desc: "Live leaderboards and instant rankings" },
            { icon: "🔐", title: "Secure", desc: "Enterprise-grade security for your code" },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to compete?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of programmers solving problems in real-time</p>
          <button
            onClick={() => navigate(user ? "/home" : "/auth")}
            className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
          >
            {user ? "Start Competing" : "Create Account"}
          </button>
        </div>
      </div>
    </main>
  );
}
