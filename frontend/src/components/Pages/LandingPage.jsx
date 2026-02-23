import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Code2, Shield, Trophy, ArrowRight, Terminal } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex-1 bg-[#0a0a0f] text-[#e8e6e3]">
      {}
      <section className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
        {}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #dc2626 1px, transparent 1px), linear-gradient(to bottom, #dc2626 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {}
            <div className="animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-medium text-red-400">
                  Competitive Coding Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                Master Your
                <br />
                <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  Code.
                </span>
              </h1>

              <p className="text-[#6b6560] text-lg mb-10 leading-relaxed max-w-md">
                Compete in real-time coding challenges. Join rooms, solve
                problems, and rank up against other developers.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate(user ? "/compete" : "/auth")}
                  className="px-7 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all hover:shadow-[0_4px_24px_rgba(220,38,38,0.35)] flex items-center gap-2 group"
                >
                  {user ? "Enter Arena" : "Get Started"}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-7 py-3 rounded-lg border border-[#1e1215] text-[#a8a29e] hover:text-[#e8e6e3] hover:border-[#2a1519] hover:bg-[#141118] font-medium text-sm transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {}
            <div
              className="hidden lg:block animate-in"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] shadow-2xl overflow-hidden">
                {}
                <div className="flex items-center gap-2 px-5 py-3 bg-[#141118] border-b border-[#1e1215]">
                  <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                  <span className="text-xs text-[#44403c] ml-3 font-mono">
                    codebreaker — live session
                  </span>
                </div>

                {}
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#141118] border border-[#1e1215]">
                    <div>
                      <p className="text-xs text-[#6b6560] mb-1">
                        Active Session
                      </p>
                      <p className="text-base font-semibold text-[#e8e6e3]">
                        Room Alpha
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6b6560] mb-1">Players</p>
                      <p className="text-base font-semibold text-[#e8e6e3]">
                        12 / 20
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-[#141118] border border-[#1e1215]">
                      <p className="text-xs text-[#6b6560] mb-1">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-red-400">98.2%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#141118] border border-[#1e1215]">
                      <p className="text-xs text-[#6b6560] mb-1">Latency</p>
                      <p className="text-2xl font-bold text-[#e8e6e3]">12ms</p>
                    </div>
                  </div>

                  {}
                  <div className="h-1.5 rounded-full bg-[#1e1215] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-red-600 to-red-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-24 border-t border-[#1e1215]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Features
            </h2>
            <p className="text-[#6b6560] text-base max-w-lg mx-auto">
              Everything you need to compete, learn, and grow as a developer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <Code2 size={22} className="text-red-400" />,
                title: "Real-Time Sync",
                desc: "Seamless real-time coding sessions with ultra-low latency WebSocket connections.",
              },
              {
                icon: <Shield size={22} className="text-red-400" />,
                title: "Secure Execution",
                desc: "Code runs in isolated Docker containers — safe, sandboxed, and controlled.",
              },
              {
                icon: <Trophy size={22} className="text-red-400" />,
                title: "Live Leaderboard",
                desc: "Track progress and compete with others on dynamic, real-time leaderboards.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-xl bg-[#0f0d12] border border-[#1e1215] hover:border-red-500/30 hover:bg-[#141118] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-5 group-hover:bg-red-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#e8e6e3] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#6b6560] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
