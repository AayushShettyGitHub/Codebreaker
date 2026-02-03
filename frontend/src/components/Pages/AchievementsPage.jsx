import { useEffect, useState } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import { useAuth } from "../../context/AuthContext";
import { toastSuccess } from "../../utils/toast";

export default function AchievementsPage() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchBadges() {
    setLoading(true);
    try {
      const res = await api.get("/badges/me");
      setBadges(res.data || []);
    } catch (err) {
      console.error("Failed to fetch badges", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBadges();

    const handleBadgeMsg = (msg) => {
      if (!msg || msg.type !== "BADGE_AWARDED") return;
      if (msg.playerId === user?.id) {
        toastSuccess(`New badge: ${msg.badge?.name}`);
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
                    <div key={b.key} className={`p-4 rounded-xl border ${b.earned ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                          <p className="text-xs text-slate-500 mt-1">{b.description}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${b.earned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {b.earned ? 'Earned' : 'Locked'}
                        </div>
                      </div>
                      {b.earned && b.awardedAt && (
                        <div className="text-xs text-slate-500 mt-2">Awarded: {new Date(b.awardedAt).toLocaleString()}</div>
                      )}
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
