import { Wifi, Globe, Cpu, Monitor } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-5xl mx-auto px-6 md:px-10 py-16">

                                <div className="mb-14">
                    <p className="text-[10px] text-red-500 uppercase tracking-widest mb-3">
                        Project Overview
                    </p>

                    <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                        About Codebreaker
                    </h1>

                    <p className="text-sm text-[#6b6560] max-w-lg leading-relaxed">
                        Codebreaker is a real-time competitive programming platform
                        designed to help developers improve through live contests,
                        fast execution, and seamless collaboration.
                    </p>
                </div>

                                <div className="grid md:grid-cols-2 gap-10 mb-16">

                                        <div className="space-y-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <span className="w-1 h-4 bg-red-600 rounded-sm"></span>
                            Core Experience
                        </h2>

                        <p className="text-sm text-[#6b6560] leading-relaxed">
                            A smooth environment for solving problems in real time.
                            Focus purely on logic while the system handles execution,
                            synchronization, and scoring.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-[#a8a29e]">
                                <Wifi size={14} className="text-red-500" />
                                Real-time sync
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[#a8a29e]">
                                <Globe size={14} className="text-red-500" />
                                Live rankings
                            </div>
                        </div>
                    </div>

                                        <div className="space-y-4">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <span className="w-1 h-4 bg-red-600 rounded-sm"></span>
                            Performance
                        </h2>

                        <p className="text-sm text-[#6b6560] leading-relaxed">
                            Optimized for low latency and high concurrency.
                            Whether private rooms or public contests, everything
                            stays responsive and reliable.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-[#a8a29e]">
                                <Cpu size={14} className="text-red-500" />
                                Fast execution
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[#a8a29e]">
                                <Monitor size={14} className="text-red-500" />
                                Clean interface
                            </div>
                        </div>
                    </div>
                </div>

                                <div className="border-t border-[#1e1215] pt-10">
                    <p className="text-[10px] text-[#6b6560] uppercase tracking-widest mb-6">
                        Tech Stack
                    </p>

                    <div className="grid sm:grid-cols-3 gap-8 text-sm">
                        <div>
                            <p className="text-xs text-red-500 mb-1">Backend</p>
                            <p className="text-[#a8a29e]">
                                Spring Boot • PostgreSQL • Redis
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-red-500 mb-1">Frontend</p>
                            <p className="text-[#a8a29e]">
                                React • Vite • TailwindCSS
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-red-500 mb-1">Infra</p>
                            <p className="text-[#a8a29e]">
                                Docker • WebSocket
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}