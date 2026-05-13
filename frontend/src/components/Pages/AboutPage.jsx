import { Wifi, Globe, Cpu, Monitor, Zap, Code, Shield, Activity, Terminal, Layers } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30 overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/5 blur-[140px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-6 md:px-10 py-24">
                <div className="mb-24 space-y-8 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Terminal size={12} className="text-indigo-400" />
                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">
                            System Status: Operational
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        The Competitive <br />
                        <span className="text-indigo-500">Coding Arena.</span>
                    </h1>

                    <p className="text-base md:text-lg text-[#a1a1aa] max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Codebreaker is a high-performance, real-time battleground where developers clash in logic, speed, and efficiency. 
                        Built for the next generation of problem solvers, we provide the infrastructure; you provide the brilliance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-32">
                    <div className="group p-8 rounded-3xl bg-[#0f0f13] border border-[#1c1c22] hover:border-indigo-500/40 hover:bg-[#121218] transition-all duration-500 shadow-2xl hover:shadow-indigo-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                            <Zap size={28} className="text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Core Experience</h2>
                        <p className="text-sm text-[#71717a] leading-relaxed mb-10">
                            A seamless, low-latency environment designed for intense focus. We handle the complex 
                            synchronization and scoring orchestration while you focus purely on the algorithm.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#09090b] border border-[#1c1c22] text-[11px] text-[#a1a1aa] font-medium transition-colors group-hover:border-indigo-500/20">
                                <Wifi size={14} className="text-indigo-400" />
                                Real-time Sync
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#09090b] border border-[#1c1c22] text-[11px] text-[#a1a1aa] font-medium transition-colors group-hover:border-indigo-500/20">
                                <Globe size={14} className="text-indigo-400" />
                                Global Arenas
                            </div>
                        </div>
                    </div>

                    <div className="group p-8 rounded-3xl bg-[#0f0f13] border border-[#1c1c22] hover:border-indigo-500/40 hover:bg-[#121218] transition-all duration-500 shadow-2xl hover:shadow-indigo-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:-rotate-3">
                            <Cpu size={28} className="text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Architecture</h2>
                        <p className="text-sm text-[#71717a] leading-relaxed mb-10">
                            Built on a robust decoupled architecture. Our execution engine is optimized for 
                            high concurrency and safety, ensuring your solutions are judged in milliseconds.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#09090b] border border-[#1c1c22] text-[11px] text-[#a1a1aa] font-medium transition-colors group-hover:border-indigo-500/20">
                                <Activity size={14} className="text-indigo-400" />
                                Batch Execution
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#09090b] border border-[#1c1c22] text-[11px] text-[#a1a1aa] font-medium transition-colors group-hover:border-indigo-500/20">
                                <Shield size={14} className="text-indigo-400" />
                                Sandboxed Env
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-16">
                    <div className="flex items-center gap-6">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#1c1c22] to-[#1c1c22]"></div>
                        <h3 className="text-[10px] font-black text-indigo-500/60 uppercase tracking-[0.4em] whitespace-nowrap">Technical Infrastructure</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#1c1c22] to-[#1c1c22]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <Terminal size={20} className="text-indigo-500" />
                                <h4 className="text-sm font-bold text-white tracking-tight">Backend</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {['Spring Boot 3', 'PostgreSQL 15', 'Redis 7', 'RabbitMQ'].map(tech => (
                                    <span key={tech} className="px-3.5 py-1.5 rounded-lg bg-[#141419] border border-[#1c1c22] text-[10px] text-[#a1a1aa] font-bold hover:text-white transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <Code size={20} className="text-indigo-500" />
                                <h4 className="text-sm font-bold text-white tracking-tight">Frontend</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {['React 19', 'Vite 7', 'Tailwind 4', 'Monaco Editor'].map(tech => (
                                    <span key={tech} className="px-3.5 py-1.5 rounded-lg bg-[#141419] border border-[#1c1c22] text-[10px] text-[#a1a1aa] font-bold hover:text-white transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-1">
                                <Layers size={20} className="text-indigo-500" />
                                <h4 className="text-sm font-bold text-white tracking-tight">DevOps</h4>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {['Docker', 'WebSocket', 'REST API', 'Containerization'].map(tech => (
                                    <span key={tech} className="px-3.5 py-1.5 rounded-lg bg-[#141419] border border-[#1c1c22] text-[10px] text-[#a1a1aa] font-bold hover:text-white transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-32 pt-16 border-t border-[#1c1c22] text-center">
                    <p className="text-xs text-[#3f3f46] font-medium">
                        Designed and Engineered with precision by the Codebreaker Team.
                    </p>
                </div>
            </div>
        </main>
    );
}