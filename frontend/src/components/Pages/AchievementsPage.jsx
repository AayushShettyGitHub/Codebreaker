import { useEffect, useState } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import { useAuth } from "../../context/AuthContext";
import { toastSuccess, toastError } from "../../utils/toast";
import { Trophy, Lock, Star, Zap, Target, Award, Flame } from "lucide-react";

const getBadgeIcon = (key, earned) => {
    const colorClass = earned ? "text-indigo-400" : "text-[#3f3f46]";
    switch (key) {
        case 'FIRST_BLOOD': return <span className="text-2xl">🩸</span>;
        case 'SPEEDSTER': return <Zap size={24} className={colorClass} />;
        case 'FIRST_PUBLIC_ROOM': return <Award size={24} className={colorClass} />;
        case 'ACCURACY_90': return <Target size={24} className={colorClass} />;
        case 'CONTRIBUTOR': return <Star size={24} className={colorClass} />;
        default:
            if (key.startsWith('STREAK')) return <Flame size={24} className={colorClass} />;
            if (key.startsWith('SOLVER')) return <Trophy size={24} className={colorClass} />;
            return <Award size={24} className={colorClass} />;
    }
};

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
        <main className="min-h-screen bg-[#09090b] text-white">
            <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            Achievements
                        </h1>
                        <p className="text-sm text-[#71717a]">
                            Track your progress and unlock milestones
                        </p>
                    </div>

                    <div className="w-full md:w-72 bg-[#0f0f13] border border-[#1c1c22] rounded-2xl p-5">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-[#71717a]">Progress</span>
                            <span className="font-semibold">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-[#1c1c22] rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-indigo-600 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-xs text-[#71717a]">
                            <span className="text-indigo-400 font-semibold">{earnedCount}</span> / {total}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#1c1c22] border-t-indigo-600 rounded-full animate-spin" />
                    </div>
                ) : Object.keys(categories).length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-[#1c1c22] rounded-2xl">
                        <Trophy size={40} className="mx-auto text-[#2a2a2a] mb-4" />
                        <p className="text-sm text-[#71717a]">No achievements yet.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {Object.entries(categories).map(([cat, list]) => (
                            <section key={cat}>
                                <h2 className="text-xs text-[#71717a] uppercase mb-6 tracking-wider">
                                    {cat.replaceAll("_", " ")}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {list.map((b) => {
                                        const earned = !!b.earned;
                                        return (
                                            <div
                                                key={b.key}
                                                className={`rounded-2xl p-6 border transition ${earned
                                                    ? "bg-[#0f0f13] border-[#1c1c22] hover:border-indigo-500/40"
                                                    : "bg-black/30 border-[#1c1c22]/40 opacity-50"
                                                }`}
                                            >
                                                <div className="flex justify-between mb-6">
                                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl ${earned
                                                        ? "bg-indigo-500/10"
                                                        : "bg-[#141419]"
                                                    }`}>
                                                        {getBadgeIcon(b.key, earned)}
                                                    </div>
                                                    <div className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1 ${earned ? "bg-indigo-600 text-white" : "bg-[#1c1c22] text-[#555]"}`}>
                                                        {earned ? <Trophy size={10} /> : <Lock size={10} />}
                                                        {earned ? "Earned" : "Locked"}
                                                    </div>
                                                </div>
                                                <h3 className="text-sm font-semibold mb-1">{b.name}</h3>
                                                <p className="text-xs text-[#71717a] mb-4 line-clamp-2">{b.description}</p>
                                                <div className="mb-5">
                                                    <div className="flex justify-between text-[10px] mb-1 text-[#71717a]">
                                                        <span>{b.count ?? 0}/{b.nextThreshold ?? 100}</span>
                                                        <span>{b.progressPercent ?? 0}%</span>
                                                    </div>
                                                    <div className="h-1 bg-[#1c1c22] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-600"
                                                            style={{ width: `${b.progressPercent ?? 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-xs pt-4 border-t border-[#1c1c22]">
                                                    <span className="text-[#71717a]">
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
                                                            className={`text-[10px] px-3 py-1.5 rounded-md transition-colors ${featured.includes(b.key)
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-[#141419] text-[#71717a] hover:text-[#a1a1aa]"
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