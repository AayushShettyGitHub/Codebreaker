import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Code2, Shield, Trophy, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <main className="flex-1 bg-[#09090b] text-[#e4e4e7]">
      {/* Hero */}
      <section className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column */}
            <div className="animate-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-xs font-medium text-indigo-400">
                  Competitive Coding Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                Master Your
                <br />
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
                  Code.
                </span>
              </h1>

              <p className="text-[#71717a] text-lg mb-10 leading-relaxed max-w-md">
                Compete in real-time coding challenges. Join rooms, solve
                problems, and rank up against other developers.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate(user ? "/compete" : "/auth")}
                  className="px-7 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all hover:shadow-[0_4px_24px_rgba(99,102,241,0.35)] flex items-center gap-2 group"
                >
                  {user ? "Enter Arena" : "Get Started"}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-7 py-3 rounded-lg border border-[#1c1c22] text-[#a1a1aa] hover:text-[#e4e4e7] hover:border-[#27272a] hover:bg-[#141419] font-medium text-sm transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right column — dashboard preview */}
            <div
              className="hidden lg:block animate-in"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="rounded-xl border border-[#1c1c22] bg-[#0f0f13] shadow-2xl overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-5 py-3 bg-[#141419] border-b border-[#1c1c22]">
                  <div className="w-3 h-3 rounded-full bg-[#3f3f46]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#3f3f46]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#3f3f46]"></div>
                  <span className="text-xs text-[#3f3f46] ml-3 font-mono">
                    codebreaker — live session
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[#141419] border border-[#1c1c22]">
                    <div>
                      <p className="text-xs text-[#71717a] mb-1">
                        Active Session
                      </p>
                      <p className="text-base font-semibold text-[#e4e4e7]">
                        Room Alpha
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#71717a] mb-1">Players</p>
                      <p className="text-base font-semibold text-[#e4e4e7]">
                        12 / 20
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-[#141419] border border-[#1c1c22]">
                      <p className="text-xs text-[#71717a] mb-1">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold text-indigo-400">98.2%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#141419] border border-[#1c1c22]">
                      <p className="text-xs text-[#71717a] mb-1">Latency</p>
                      <p className="text-2xl font-bold text-[#e4e4e7]">12ms</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-[#1c1c22] overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-[#1c1c22]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Features
            </h2>
            <p className="text-[#71717a] text-base max-w-lg mx-auto">
              Everything you need to compete, learn, and grow as a developer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: <Code2 size={22} className="text-indigo-400" />,
                title: "Real-Time Sync",
                desc: "Seamless real-time coding sessions with ultra-low latency WebSocket connections.",
              },
              {
                icon: <Shield size={22} className="text-indigo-400" />,
                title: "Secure Execution",
                desc: "Code runs in isolated Docker containers — safe, sandboxed, and controlled.",
              },
              {
                icon: <Trophy size={22} className="text-indigo-400" />,
                title: "Live Leaderboard",
                desc: "Track progress and compete with others on dynamic, real-time leaderboards.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-xl bg-[#0f0f13] border border-[#1c1c22] hover:border-indigo-500/30 hover:bg-[#141419] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:bg-indigo-500/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#e4e4e7] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#71717a] leading-relaxed">
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
