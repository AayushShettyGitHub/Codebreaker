import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">Master Competitive Programming</h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Real-time coding competitions with instant feedback, leaderboards, and community challenges. Level up your coding skills today.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(user ? "/compete" : "/auth")}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  {user ? "Start Competing" : "Get Started"}
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-blue-600 text-gray-900 hover:text-blue-600 font-semibold rounded-lg transition-colors duration-200"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="text-7xl">🚀</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why CodeBreaker?</h2>
            <p className="text-lg text-gray-600">Everything you need to compete and improve</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "⚡", title: "Lightning Fast", desc: "Real-time updates keep everyone in sync with instant feedback" },
              { icon: "🏆", title: "Competitive", desc: "Live leaderboards and instant rankings to track your progress" },
              { icon: "🔐", title: "Secure", desc: "Enterprise-grade security for your code and data" },
            ].map((feature, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow duration-200">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to compete?</h2>
          <p className="text-xl text-blue-100 mb-10">Join thousands of programmers solving problems in real-time</p>
          <button
            onClick={() => navigate(user ? "/compete" : "/auth")}
            className="px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg rounded-lg transition-colors duration-200"
          >
            {user ? "Start Now" : "Create Account"}
          </button>
        </div>
      </section>
    </main>
  );
}
