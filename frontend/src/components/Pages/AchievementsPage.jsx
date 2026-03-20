import { useEffect, useState } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import { useAuth } from "../../context/AuthContext";
import { toastSuccess, toastError } from "../../utils/toast";
import { Trophy, Lock, Star } from "lucide-react";

export default function AchievementsPage() {
    const { user } = useAuth();
    const [badges, setBadges] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchBadges() {
        setLoading(true);
        try {
            const [badgesRes, meRes] = await Promise.all([
                api.get("/badges/me"),
                api.get("/players/me")
            ]);
            setBadges(badgesRes.data || []);
            setFeatured(meRes.data?.featuredBadges || []);
        } catch (err) {
            toastError("Failed to load badges.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBadges();

        const handler = (msg) => {
            if (
                (msg?.type === "BADGE_AWARDED" || msg?.type === "BADGE_UPDATED") &&
                msg.playerId === user?.id
            ) {
                toastSuccess(`New badge: ${msg.badge?.name}`);
                fetchBadges();
            }
        };

        websocketService.subscribe("/topic/badges", handler);
        return () => websocketService.unsubscribe("/topic/badges");
    }, [user?.id]);

    const categories = {};
    badges.forEach((b) => {
        const cat = b.category || "MISC";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(b);
    });

    const earnedCount = badges.filter(b => b.earned).length;
    const total = badges.length;
    const progressPercent = total ? Math.round((earnedCount / total) * 100) : 0;

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">

                                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Achievements
                        </h1>
                        <p className="text-sm text-[#6b6560]">
                            Track your progress and unlock milestones
                        </p>
                    </div>

                    <div className="w-full md:w-72 bg-[#111016] border border-[#1e1215] rounded-2xl p-5">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-[#6b6560]">Progress</span>
                            <span className="font-semibold">{progressPercent}%</span>
                        </div>

                        <div className="h-1.5 bg-[#1e1215] rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-red-600 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        <p className="text-xs text-[#6b6560]">
                            <span className="text-red-500 font-semibold">{earnedCount}</span> / {total}
                        </p>
                    </div>
                </div>

                                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#1e1215] border-t-red-600 rounded-full animate-spin" />
                    </div>
                ) : Object.keys(categories).length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-[#1e1215] rounded-2xl">
                        <Trophy size={40} className="mx-auto text-[#2a2a2a] mb-4" />
                        <p className="text-sm text-[#6b6560]">
                            No achievements yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.entries(categories).map(([cat, list]) => (
                            <section key={cat}>
                                <h2 className="text-xs text-[#6b6560] uppercase mb-6 tracking-wider">
                                    {cat.replaceAll("_", " ")}
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {list.map((b) => {
                                        const earned = !!b.earned;

                                        return (
                                            <div
                                                key={b.key}
                                                className={`rounded-2xl p-6 border transition ${earned
                                                        ? "bg-[#0d0d12] border-[#1e1215] hover:border-red-600/40"
                                                        : "bg-black/30 border-[#1e1215]/40 opacity-50"
                                                    }`}
                                            >
                                                                                                <div className="flex justify-between mb-6">
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl ${earned
                                                            ? "bg-red-600/10 text-red-500"
                                                            : "bg-[#141118] text-[#44403c]"
                                                        }`}>
                                                        {b.key === 'first_solve' ? '🥇'
                                                            : b.key === 'top_3' ? '⭐'
                                                                : b.key === 'participant' ? '🎗️'
                                                                    : <Star size={20} />}
                                                    </div>

                                                    <div className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 ${earned ? "bg-red-600 text-white" : "bg-[#1e1215] text-[#555]"
                                                        }`}>
                                                        {earned ? <Trophy size={10} /> : <Lock size={10} />}
                                                        {earned ? "Earned" : "Locked"}
                                                    </div>
                                                </div>

                                                                                                <h3 className="text-sm font-semibold mb-1">
                                                    {b.name}
                                                </h3>
                                                <p className="text-xs text-[#6b6560] mb-4 line-clamp-2">
                                                    {b.description}
                                                </p>

                                                                                                <div className="mb-5">
                                                    <div className="flex justify-between text-[10px] mb-1 text-[#6b6560]">
                                                        <span>{b.count ?? 0}/{b.nextThreshold ?? 100}</span>
                                                        <span>{b.progressPercent ?? 0}%</span>
                                                    </div>

                                                    <div className="h-1 bg-[#1e1215] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-red-600"
                                                            style={{ width: `${b.progressPercent ?? 0}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                                                                <div className="flex justify-between items-center text-xs pt-4 border-t border-[#1e1215]">
                                                    <span className="text-[#6b6560]">
                                                        {earned && b.awardedAt
                                                            ? new Date(b.awardedAt).toLocaleDateString()
                                                            : "Not earned"}
                                                    </span>

                                                    {earned && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const newFeatured = featured.includes(b.key)
                                                                        ? featured.filter(x => x !== b.key)
                                                                        : (featured.length < 3 ? [...featured, b.key] : featured);

                                                                    if (!featured.includes(b.key) && featured.length >= 3) {
                                                                        toastError("Max 3 featured");
                                                                        return;
                                                                    }

                                                                    await api.post('/players/me/featured', { badges: newFeatured });
                                                                    setFeatured(newFeatured);
                                                                    toastSuccess("Updated");
                                                                } catch {
                                                                    toastError("Failed");
                                                                }
                                                            }}
                                                            className={`text-[10px] px-3 py-1.5 rounded-md ${featured.includes(b.key)
                                                                    ? "bg-red-600 text-white"
                                                                    : "bg-[#141118] text-[#6b6560]"
                                                                }`}
                                                        >
                                                            {featured.includes(b.key) ? "Featured" : "Feature"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}