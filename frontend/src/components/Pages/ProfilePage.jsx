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

  useEffect(() => {
    if (!user) return;
    (async function(){
      try {
        const res = await api.get('/players/me/badges');
        setBadges(res.data || []);
      } catch (err) {
        console.error('Failed to load badges', err);
      }
    })();
  }, [user]);

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
                {badges.map((b) => (
                  <div key={b.key} className="flex flex-col items-center p-3 border border-slate-100 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center font-bold text-white mb-2">🏅</div>
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-slate-500 text-center">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
