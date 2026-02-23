import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/client";
import { User, Award, Clock, Star } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#e8e6e3] mb-4">Login Required</h2>
          <button
            onClick={() => navigate("/auth")}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-all"
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
    (async function () {
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
    <main className="flex-1 bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[#e8e6e3] mb-2">Profile</h1>
          <p className="text-sm text-[#6b6560]">Your activity, statistics, and earned achievements.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-8 text-center sticky top-24">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 mx-auto mb-5 flex items-center justify-center text-3xl font-bold text-white">
                {user.username?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-[#e8e6e3]">{user.username}</h2>
              <p className="text-xs text-[#6b6560] mt-1">Codebreaker</p>

              <div className="mt-6 pt-6 border-t border-[#1e1215] space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <Clock size={14} className="text-[#44403c]" />
                  <div>
                    <p className="text-xs text-[#44403c]">Joined</p>
                    <p className="text-xs font-medium text-[#a8a29e]">Jan 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-3.5 h-3.5 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <div>
                    <p className="text-xs text-[#44403c]">Status</p>
                    <p className="text-xs font-medium text-green-400">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-3 space-y-6">
            {}
            <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-6">
              <h3 className="text-sm font-semibold text-[#e8e6e3] mb-5">Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Solved", value: "12", icon: <Award size={16} className="text-red-400" /> },
                  { label: "Participated", value: "5", icon: <User size={16} className="text-red-400" /> },
                  { label: "Rank", value: "#24", icon: <Star size={16} className="text-red-400" /> },
                  { label: "Score", value: "2450", icon: <Award size={16} className="text-red-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[#141118] border border-[#1e1215]">
                    <div className="flex items-center gap-2 mb-2">
                      {stat.icon}
                      <p className="text-xs text-[#6b6560]">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-[#e8e6e3]">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-6">
                <h3 className="text-sm font-semibold text-[#e8e6e3] mb-5">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-[#1e1215] last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-xs font-medium text-red-400 flex-shrink-0">
                        {String(i).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e8e6e3]">Solved Problem</p>
                        <p className="text-xs text-[#6b6560] mt-0.5">Problem {i} completed</p>
                        <p className="text-xs text-[#44403c] mt-1">{i}h ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {}
              <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] p-6">
                <h3 className="text-sm font-semibold text-[#e8e6e3] mb-5">Achievements</h3>
                <div className="space-y-3">
                  {badges.length === 0 && (
                    <div className="py-10 text-center rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                      <p className="text-xs text-[#44403c]">No achievements earned yet.</p>
                    </div>
                  )}
                  {badges.map((b) => {
                    const earned = !!b.earned;
                    return (
                      <div key={b.key} className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${earned ? 'border-[#1e1215] bg-[#141118]' : 'border-[#1e1215]/50 bg-[#0a0a0f] opacity-40'}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${earned ? 'bg-red-500/10 text-red-400' : 'bg-[#141118] text-[#44403c]'}`}>
                          {featured.includes(b.key) ? '★' : '◈'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e8e6e3] truncate">{b.name}</p>
                          <p className="text-xs text-[#6b6560]">{b.rank}</p>
                        </div>
                        <button
                          disabled={!earned}
                          onClick={() => toggleFeatured(b.key)}
                          className={`px-3 py-1 text-xs font-medium rounded-md border transition-all flex-shrink-0 ${featured.includes(b.key)
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-[#1e1215] text-[#6b6560] hover:border-red-500/30 hover:text-red-400'
                            } ${!earned ? 'cursor-not-allowed opacity-0' : ''}`}
                        >
                          {featured.includes(b.key) ? 'Featured' : 'Feature'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
