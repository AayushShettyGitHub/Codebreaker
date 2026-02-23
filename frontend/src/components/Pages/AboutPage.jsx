import { Code2, Wifi, Globe, Server, Layout, Database, Cpu, Monitor } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="flex-1 bg-[#0a0a0f]">
            <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-20 py-20">
                {}
                <div className="mb-14">
                    <p className="text-xs font-medium text-red-400 mb-2">About</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#e8e6e3] mb-4">
                        About Codebreaker
                    </h1>
                    <div className="w-16 h-1 rounded-full bg-gradient-to-r from-red-500 to-red-700"></div>
                </div>

                {}
                <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <h2 className="text-lg font-semibold text-[#e8e6e3] mb-4 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Our Mission
                    </h2>
                    <p className="text-[#a8a29e] text-sm leading-relaxed max-w-2xl">
                        Codebreaker is a real-time competitive programming platform. We
                        provide a space for developers to test their coding skills in live
                        environments. Real-time synchronization. Accurate rankings. Seamless
                        competition.
                    </p>
                </div>

                {}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {[
                        {
                            icon: <Wifi size={20} className="text-red-400" />,
                            title: "Real-Time",
                            desc: "Instant synchronization across all active players.",
                        },
                        {
                            icon: <Globe size={20} className="text-red-400" />,
                            title: "Leaderboards",
                            desc: "Live tracking of all user performance data.",
                        },
                        {
                            icon: <Code2 size={20} className="text-red-400" />,
                            title: "Global Connectivity",
                            desc: "Secure channels for global coding challenges.",
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-6 hover:border-red-500/20 hover:bg-[#141118] transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/15 transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-[#e8e6e3] mb-2">
                                {item.title}
                            </h3>
                            <p className="text-xs text-[#6b6560] leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {}
                <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-8">
                    <h2 className="text-lg font-semibold text-[#e8e6e3] mb-8">
                        System Architecture
                    </h2>
                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xs font-medium text-[#6b6560] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Server size={14} /> Backend
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Spring Boot", "WebSocket", "PostgreSQL", "Docker"].map(
                                    (tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1.5 rounded-md bg-[#141118] border border-[#1e1215] text-xs text-[#a8a29e] font-medium"
                                        >
                                            {tech}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-medium text-[#6b6560] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Monitor size={14} /> Frontend
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["React 19", "Vite", "TailwindCSS", "Monaco Editor"].map(
                                    (tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1.5 rounded-md bg-[#141118] border border-[#1e1215] text-xs text-[#a8a29e] font-medium"
                                        >
                                            {tech}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
