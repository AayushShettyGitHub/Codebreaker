import { useEffect, useState } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import { useAuth } from "../../context/AuthContext";
import { toastSuccess, toastError } from "../../utils/toast";

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

  return (
    <main className="flex-1">
      <div className="container max-w-5xl mx-auto py-12 px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-sm text-slate-600 mt-1">Track your badges and progress.</p>
          <div className="mt-4 text-sm text-slate-700">Progress: <span className="font-semibold">{earnedCount}</span> / <span className="font-semibold">{total}</span> badges earned</div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : (
          Object.keys(categories).length === 0 ? (
            <div className="text-center py-8 text-slate-600">No badges defined yet.</div>
          ) : (
            Object.entries(categories).map(([cat, list]) => (
              <section key={cat} className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">{cat.replaceAll('_', ' ')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {list.map(b => (
                    <div key={b.key} className={`p-4 rounded-xl border ${b.earned ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200 opacity-75 filter grayscale'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-black">{b.name} <span className="text-xs ml-2 text-gray-500">{b.rank || 'NONE'}</span></p>
                          <p className="text-xs text-gray-700 mt-1">{b.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.earned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.earned ? `Earned${b.count && b.count > 1 ? ` (x${b.count})` : ''}` : 'Locked'}
                        </div>
                      </div>

                      {/* progress bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className={`h-3 rounded-full ${b.rank === 'PLATINUM' ? 'bg-purple-500' : b.rank === 'DIAMOND' ? 'bg-sky-400' : b.rank === 'GOLD' ? 'bg-yellow-400' : b.rank === 'SILVER' ? 'bg-gray-400' : 'bg-amber-400'}`} style={{ width: `${b.progressPercent ?? 0}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-2 text-gray-600">
                          <div>{b.count ?? 0} / {b.nextThreshold ?? 1} ({b.nextRank ?? 'BRONZE'})</div>
                          <div>{b.progressPercent ?? 0}%</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500">{b.earned && b.awardedAt ? `Awarded: ${new Date(b.awardedAt).toLocaleString()}` : 'Not earned yet'}</div>
                        <div>
                          {b.earned && (
                            <button
                              onClick={async () => {
                                try {
                                  const newFeatured = featured.includes(b.key) ? featured.filter(x => x !== b.key) : (featured.length < 3 ? [...featured, b.key] : featured);
                                  if (!featured.includes(b.key) && featured.length >= 3) {
                                    toastError('You can feature at most 3 badges');
                                    return;
                                  }
                                  await api.post('/players/me/featured', { badges: newFeatured });
                                  setFeatured(newFeatured);
                                  toastSuccess('Featured badges updated');
                                } catch (err) {
                                  console.error('Failed to update featured badges', err);
                                  toastError('Failed to update featured badges');
                                }
                              }}
                              className={`text-xs px-3 py-1 rounded-lg font-semibold ${featured.includes(b.key) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                              {featured.includes(b.key) ? '★ Featured' : 'Feature'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )
        )}
      </div>
    </main>
  );
}
