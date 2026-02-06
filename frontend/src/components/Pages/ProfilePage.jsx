import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/client";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h2>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  const [badges, setBadges] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    if (!user) return;
    (async function(){
      try {
        const [badgesRes, meRes] = await Promise.all([
          api.get('/badges/me'),
          api.get('/players/me')
        ]);
        setBadges(badgesRes.data || []);
        setFeatured(meRes.data?.featuredBadges || []);
      } catch (err) {
        console.error('Failed to load profile', err);
        alert('Failed to load profile.');
      }
    })();
  }, [user]);

  const toggleFeatured = async (badgeKey) => {
    try {
      const newFeatured = featured.includes(badgeKey) ? featured.filter(x => x !== badgeKey) : (featured.length < 3 ? [...featured, badgeKey] : featured);
      if (!featured.includes(badgeKey) && featured.length >= 3) {
        alert('You can feature at most 3 badges');
        return;
      }
      await api.post('/players/me/featured', { badges: newFeatured });
      setFeatured(newFeatured);
    } catch (err) {
      console.error('Failed to update featured badges', err);
      alert('Failed to update featured badges');
    }
  };

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Profile</h1>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center sticky top-24">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-white">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
              <p className="text-slate-600 mt-2">Competitive Programmer</p>
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Member Since</p>
                  <p className="font-semibold text-slate-900">January 2026</p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <p className="font-semibold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Statistics</h3>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Problems Solved", value: "12" },
                  { label: "Competitions", value: "5" },
                  { label: "Current Rank", value: "#24" },
                  { label: "Total Score", value: "2,450" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-200 last:border-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">✓</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">Solved Problem #{i}</p>
                      <p className="text-sm text-slate-600">Completed in competition</p>
                      <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.length === 0 && <p className="text-slate-600">No badges yet. Play public rooms to earn badges!</p>}
                {badges.map((b) => {
                  const rank = (b.rank || '').toUpperCase();
                  const earned = !!b.earned;
                  const getColors = (r) => {
                    switch (r) {
                      case 'GOLD': return { bg: 'bg-yellow-50', dot: 'bg-yellow-200', text: 'text-amber-900' };
                      case 'DIAMOND': return { bg: 'bg-indigo-50', dot: 'bg-indigo-200', text: 'text-indigo-900' };
                      case 'PLATINUM': return { bg: 'bg-slate-50', dot: 'bg-slate-200', text: 'text-slate-900' };
                      case 'SILVER': return { bg: 'bg-slate-50', dot: 'bg-slate-200', text: 'text-slate-900' };
                      case 'BRONZE': default: return { bg: 'bg-amber-50', dot: 'bg-amber-200', text: 'text-amber-900' };
                    }
                  };

                  const cols = getColors(rank);

                  return (
                    <div key={b.key} className={`flex flex-col items-center p-3 border rounded-lg ${earned ? 'border-slate-100' : 'border-gray-200 bg-gray-50 opacity-80 filter grayscale'}`}>
                      <div className={`w-12 h-12 rounded-full ${cols.dot} flex items-center justify-center font-bold ${cols.text} mb-2`}>🏅</div>
                      <p className={`text-sm font-semibold ${cols.text}`}>{b.name} <span className="text-xs text-gray-500 ml-1">{b.rank}</span></p>
                      <p className="text-xs text-gray-700 text-center">{b.description}</p>
                      <div className="text-xs text-gray-600 mt-2">Progress: {b.progressPercent ?? 0}%</div>
                      <div className="mt-2">
                        <button disabled={!earned} onClick={() => toggleFeatured(b.key)} className={`text-xs px-3 py-1 rounded ${featured.includes(b.key) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} ${!earned ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {featured.includes(b.key) ? '★ Featured' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
