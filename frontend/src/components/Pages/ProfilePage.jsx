import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../config/client";
import { Award, Clock, ArrowLeft, Trophy } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async function () {
      try {
        const [badgesRes, meRes] = await Promise.all([
          api.get('/badges/me'),
          api.get('/players/me')
        ]);
        setBadges(badgesRes.data || []);
        setPlayerData(meRes.data || null);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-4">Login Required</h2>
          <button
            onClick={() => navigate("/auth")}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14">

        <div className="mb-12 flex flex-col md:flex-row md:items-end gap-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-2xl font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-semibold">
                  {user.username}
                </h1>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-[#71717a]">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Joined 2026
                </span>

              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          <div className="p-5 rounded-2xl bg-[#0f0f13] border border-[#1c1c22]">

          </div>



          <div className="p-5 rounded-2xl bg-[#0f0f13] border border-[#1c1c22]">
            <p className="text-xs text-[#71717a] mb-1">Achievements</p>
            <p className="text-2xl font-semibold">
              {badges.filter(b => b.earned).length}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Achievements</h2>
              <p className="text-xs text-[#71717a]">
                Your earned badges
              </p>
            </div>

            <button
              onClick={() => navigate('/achievements')}
              className="text-xs px-4 py-1.5 bg-[#141419] rounded-lg border border-[#1c1c22] text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
            >
              View All
            </button>
          </div>

          {badges.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#1c1c22] rounded-xl">
              <p className="text-sm text-[#71717a]">
                No achievements yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {badges.slice(0, 8).map((b) => (
                <div
                  key={b.key}
                  className={`p-4 rounded-xl border text-center ${b.earned
                    ? "bg-[#0f0f13] border-[#1c1c22]"
                    : "bg-black/30 border-[#1c1c22]/40 opacity-40"
                    }`}
                >
                  <div className={`text-2xl mb-2 ${b.earned ? "" : "grayscale opacity-40"}`}>
                    {b.key === 'FIRST_BLOOD' ? '🩸'
                      : b.key === 'SPEEDSTER' ? '⚡'
                        : b.key === 'CONTRIBUTOR' ? '⭐'
                          : b.key === 'ACCURACY_90' ? '🎯'
                            : b.key.startsWith('STREAK') ? '🔥'
                              : b.key.startsWith('SOLVER') ? '🏆'
                                : '🎖️'}
                  </div>

                  <p className="text-xs font-medium truncate">
                    {b.name}
                  </p>

                  <p className="text-[10px] text-[#71717a] mt-1">
                    {b.category?.replaceAll("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-xs text-[#71717a] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}