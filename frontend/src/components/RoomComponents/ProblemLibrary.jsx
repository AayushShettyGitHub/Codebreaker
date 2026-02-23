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
                <div className="w-8 h-8 border-2 border-[#1e1215] border-t-red-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in">
            {}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search problems (e.g. DP, Math)..."
                        className="w-full px-4 py-3 pl-10 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#44403c]" />
                </div>
                <select
                    className="px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all min-w-[180px] appearance-none cursor-pointer"
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                    <option value="ALL">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                </select>
            </div>

            {}
            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem) => (
                        <div
                            key={problem.id}
                            className="rounded-xl border border-[#1e1215] bg-[#141118] p-5 hover:border-red-500/20 hover:bg-[#1a1520] transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h3 className="text-sm font-semibold text-[#e8e6e3] group-hover:text-red-400 transition-colors truncate">
                                        {problem.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${problem.difficulty === "EASY" ? "bg-green-500/10 text-green-400" :
                                            problem.difficulty === "MEDIUM" ? "bg-yellow-500/10 text-yellow-400" :
                                                "bg-red-500/10 text-red-400"
                                            }`}>
                                            {problem.difficulty}
                                        </span>
                                        {problem.tags?.map((tag, i) => (
                                            <span key={i} className="text-xs bg-[#0f0d12] text-[#6b6560] px-2 py-0.5 rounded-md border border-[#1e1215]">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectProblem(problem)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-[0_2px_12px_rgba(220,38,38,0.25)] flex-shrink-0"
                                >
                                    Select
                                </button>
                            </div>
                            <p className="text-xs text-[#6b6560] line-clamp-2 leading-relaxed">
                                {problem.description}
                            </p>
                        </div>
                    )
                    )) : (
                    <div className="text-center py-16 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                        <p className="text-sm text-[#44403c]">No problems found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
