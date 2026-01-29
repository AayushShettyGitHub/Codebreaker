import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block mb-4 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                Real-time coding battles
              </span>

              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Competitive coding, made live.
              </h1>

              <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-lg">
                Join live rooms, solve challenging problems in real-time, compete with programmers worldwide, and climb the rankings.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate(user ? "/compete" : "/auth")}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  {user ? "Start Competing" : "Get Started"}
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-8 py-3 bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-blue-100 to-slate-100 rounded-2xl p-8 min-h-96 flex flex-col items-center justify-center">
                <div className="w-full space-y-4">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-900">Live Room: Algorithm Battle</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>Players: 12 active</p>
                      <p>Problem: Dynamic Programming</p>
                      <p>Time: 2:34 remaining</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['2,150', '847', '#12'].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg p-4 text-center shadow-sm border border-slate-200">
                        <p className="text-lg font-bold text-slate-900">{stat}</p>
                        <p className="text-xs text-slate-600 mt-1">{['Points', 'Solved', 'Rank'][i]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-16">Why CodeBreaker?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Real-Time Sync', desc: 'Instant synchronization across all competitors' },
              { title: 'Live Rankings', desc: 'See your position update as you code' },
              { title: 'Community', desc: 'Compete with programmers worldwide' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold mb-4">●</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
