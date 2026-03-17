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

  return (
    <main className="flex-1 bg-[#0a0a0f] min-h-screen text-[#e8e6e3]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Profile Card */}
        <div className="rounded-3xl border border-[#1e1215] bg-[#0f0d12] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]">
          {/* Header/Hero Section */}
          <div className="h-48 bg-gradient-to-br from-[#1a1114] via-[#0f0d12] to-black border-b border-[#1e1215] relative">
            <div className="absolute -bottom-16 left-10 flex items-end gap-6">
              <div className="p-1.5 bg-[#0f0d12] rounded-full border border-[#1e1215]">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-5xl font-bold text-white shadow-2xl">
                  {user.username?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="pb-4">
                 <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold tracking-tight">{user.username}</h1>
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                       {playerData?.role || 'PARTICIPANT'}
                    </span>
                 </div>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[#6b6560]">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Joined Jan 2026</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-xs font-medium text-green-400">Online</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="pt-24 pb-12 px-10">
            {/* Stats Bar */}
            <div className="flex gap-4 mb-12">
               <div className="flex-1 p-6 rounded-2xl bg-[#141118] border border-[#1e1215] hover:border-red-500/10 transition-colors">
                  <p className="text-[10px] font-bold text-[#44403c] uppercase tracking-[0.2em] mb-1">Total Score</p>
                  <p className="text-3xl font-black">{playerData?.score || 0}</p>
               </div>
               <div className="flex-1 p-6 rounded-2xl bg-[#141118] border border-[#1e1215] hover:border-red-500/10 transition-colors">
                  <p className="text-[10px] font-bold text-[#44403c] uppercase tracking-[0.2em] mb-1">Global Rank</p>
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    <p className="text-3xl font-black">#24</p>
                  </div>
               </div>
            </div>

            {/* Badges Layout */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-[#1e1215]">
                <Award size={20} className="text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#e8e6e3]">Achievements & Unlocks</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {badges.length === 0 ? (
                  <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-[#1e1215] bg-[#141118]/20">
                     <p className="text-sm text-[#44403c]">Complete problems to unlock premium badges.</p>
                  </div>
                ) : (
                  badges.map((b) => (
                    <div 
                      key={b.key}
                      className={`relative group p-5 rounded-2xl border transition-all duration-300 ${
                        b.earned 
                        ? 'bg-[#141118] border-[#1e1215] hover:border-red-500/20 hover:bg-[#1a171f]' 
                        : 'bg-[#0a0a0f] border-[#1e1215]/50 opacity-40 grayscale'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform duration-500 group-hover:rotate-12 ${
                          b.earned ? 'bg-red-500/10 text-red-500' : 'bg-[#141118] text-[#44403c]'
                        }`}>
                          {b.key === 'first_solve' ? '🥇' : b.key === 'top_3' ? '⭐' : b.key === 'participant' ? '🎗️' : '◈'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{b.name}</p>
                          <p className={`text-[10px] font-bold mt-1 tracking-wider uppercase ${
                            b.rank === 'GOLD' ? 'text-yellow-500' : 
                            b.rank === 'SILVER' ? 'text-gray-400' : 
                            'text-[#6b6560]'
                          }`}>{b.rank}</p>
                        </div>
                      </div>
                      {b.earned && (
                         <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="mt-10 flex justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="group flex items-center gap-2 text-[10px] font-bold text-[#44403c] hover:text-[#e8e6e3] transition-all uppercase tracking-[0.3em]"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Return to Dashboard
            </button>
        </div>
      </div>
    </main>
  );
}
