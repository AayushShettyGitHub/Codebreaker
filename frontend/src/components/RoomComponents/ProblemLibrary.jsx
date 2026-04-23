import { useEffect, useState } from "react";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";
import { Search } from "lucide-react";

export default function ProblemLibrary({ onSelectProblem }) {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("ALL");

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const res = await api.get("/problem-library");
                setProblems(res.data);
            } catch (err) {
                console.error("Failed to fetch problem library:", err);
                toastError("Failed to load problem library");
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, []);

    const filteredProblems = problems.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDifficulty = difficultyFilter === "ALL" || p.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-2 border-[#1c1c22] border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search problems (e.g. DP, Math)..."
                        className="w-full px-4 py-3 pl-10 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-[#3f3f46]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3f3f46]" />
                </div>
                <select
                    className="px-4 py-3 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all min-w-[150px] appearance-none cursor-pointer"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                    <option value="ALL">All</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
                <button
                    onClick={async () => {
                        try {
                            await api.post("/problem-library/seed");
                            toastSuccess("Library refresh triggered!");
                            const res = await api.get("/problem-library");
                            setProblems(res.data);
                        } catch (err) {
                            toastError("Failed to seed library");
                        }
                    }}
                    className="px-4 py-3 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-lg text-xs font-bold transition-all uppercase tracking-widest whitespace-nowrap"
                >
                    Refresh Library
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                        <div
                            key={problem.id}
                            className="rounded-xl border border-[#1c1c22] bg-[#141419] p-5 hover:border-indigo-500/20 hover:bg-[#1a1520] transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-sm font-semibold text-[#e4e4e7] group-hover:text-indigo-400 transition-colors truncate">
                                        {problem.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${problem.difficulty === "EASY" ? "bg-green-500/10 text-green-400" :
                                            problem.difficulty === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                                                "bg-indigo-500/10 text-indigo-400"
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                        {problem.tags?.map((tag, i) => (
                                            <span key={i} className="text-xs bg-[#0f0f13] text-[#71717a] px-2 py-0.5 rounded-md border border-[#1c1c22]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectProblem(problem)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-[0_2px_12px_rgba(220,38,38,0.25)] flex-shrink-0"
                                >
                                    Select
                                </button>
                            </div>
                            <p className="text-xs text-[#71717a] line-clamp-2 leading-relaxed">
                                {problem.description}
                            </p>
                        </div>
                    )
                    )) : (
                    <div className="text-center py-16 rounded-lg border border-dashed border-[#1c1c22] bg-[#141419]">
                        <p className="text-sm text-[#3f3f46]">No problems found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
