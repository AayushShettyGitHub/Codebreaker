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
            console.error("Failed to fetch badges", err);
            toastError("Failed to load badges. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBadges();

        const handleBadgeMsg = (msg) => {
            if (!msg) return;
            if ((msg.type === "BADGE_AWARDED" || msg.type === "BADGE_UPDATED") && msg.playerId === user?.id) {
                toastSuccess(`New badge activity: ${msg.badge?.name}`);
                fetchBadges();
            }
        };

        websocketService.subscribe("/topic/badges", handleBadgeMsg);
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
    const progressPercent = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

    return (
        <main className="flex-1 bg-[#0a0a0f]">
            <div className="max-w-[1440px] mx-auto py-12 px-8 md:px-16 lg:px-20">
                <header className="mb-14">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Trophy size={20} className="text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#e8e6e3]">Achievements</h1>
                    </div>

                    {}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 h-2 rounded-full bg-[#1e1215] overflow-hidden max-w-xs">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-[#a8a29e] font-medium">
                            <span className="text-[#e8e6e3]">{earnedCount}</span> / {total} earned
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="w-8 h-8 border-2 border-[#1e1215] border-t-red-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    Object.keys(categories).length === 0 ? (
                        <div className="text-center py-20 rounded-xl border border-dashed border-[#1e1215] bg-[#0f0d12]">
                            <p className="text-sm text-[#44403c]">No achievements found yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(categories).map(([cat, list]) => (
                                <section key={cat}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-sm font-semibold text-[#e8e6e3]">
                                            {cat.replaceAll('_', ' ')}
                                        </h2>
                                        <div className="flex-1 h-px bg-[#1e1215]"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {list.map(b => {
                                            const earned = !!b.earned;
                                            return (
                                                <div key={b.key} className={`rounded-xl p-6 border transition-all ${earned ? 'border-[#1e1215] bg-[#0f0d12] hover:border-red-500/20' : 'border-[#1e1215]/50 bg-[#0a0a0f] opacity-40'}`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <p className="text-sm font-semibold text-[#e8e6e3] truncate">{b.name}</p>
                                                            <p className="text-xs text-[#6b6560] mt-1">{b.rank || 'N/A'}</p>
                                                        </div>
                                                        <div className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${earned ? 'bg-red-500/10 text-red-400' : 'bg-[#141118] text-[#44403c]'}`}>
                                                            {earned ? <Star size={12} /> : <Lock size={12} />}
                                                            {earned ? 'Earned' : 'Locked'}
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-[#6b6560] leading-relaxed mb-5 line-clamp-2">
                                                        {b.description}
                                                    </p>

                                                    {}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-[#44403c]">{b.count ?? 0} / {b.nextThreshold ?? 1}</span>
                                                            <span className="text-[#a8a29e] font-medium">{b.progressPercent ?? 0}%</span>
                                                        </div>
                                                        <div className="w-full bg-[#1e1215] h-1.5 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500" style={{ width: `${b.progressPercent ?? 0}%` }}></div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 pt-4 border-t border-[#1e1215] flex items-center justify-between">
                                                        <span className="text-xs text-[#44403c]">
                                                            {earned && b.awardedAt ? `Earned ${new Date(b.awardedAt).toLocaleDateString()}` : 'Not earned yet'}
                                                        </span>
                                                        {earned && (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const newFeatured = featured.includes(b.key) ? featured.filter(x => x !== b.key) : (featured.length < 3 ? [...featured, b.key] : featured);
                                                                        if (!featured.includes(b.key) && featured.length >= 3) {
                                                                            toastError('You can feature at most 3 achievements.');
                                                                            return;
                                                                        }
                                                                        await api.post('/players/me/featured', { badges: newFeatured });
                                                                        setFeatured(newFeatured);
                                                                        toastSuccess('Updated featured badge.');
                                                                    } catch (err) {
                                                                        console.error('Failed to update featured badges', err);
                                                                        toastError('Failed to feature achievement.');
                                                                    }
                                                                }}
                                                                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${featured.includes(b.key)
                                                                    ? 'bg-red-600 text-white'
                                                                    : 'border border-[#1e1215] text-[#6b6560] hover:border-red-500/30 hover:text-red-400'
                                                                    }`}>
                                                                {featured.includes(b.key) ? '★ Featured' : 'Feature'}
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
                    )
                )}
            </div>
        </main>
    );
}
