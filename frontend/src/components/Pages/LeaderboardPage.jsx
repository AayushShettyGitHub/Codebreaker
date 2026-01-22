import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLeaderboard([
        { rank: 1, username: "CodeMaster", score: 4520, solved: 28, level: "Expert" },
        { rank: 2, username: "PythonGuru", score: 4210, solved: 26, level: "Advanced" },
        { rank: 3, username: "JavaNinja", score: 3890, solved: 24, level: "Advanced" },
        { rank: 4, username: user?.username || "YourselfRank", score: 2450, solved: 12, level: "Intermediate" },
        { rank: 5, username: "AlgoMaster", score: 2100, solved: 15, level: "Intermediate" },
        { rank: 6, username: "ReactPro", score: 1890, solved: 11, level: "Beginner" },
        { rank: 7, username: "DataEngineer", score: 1650, solved: 9, level: "Beginner" },
        { rank: 8, username: "FullStackDev", score: 1420, solved: 7, level: "Beginner" },
      ]);
      setLoading(false);
    }, 500);
  }, [user]);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
          <p className="text-gray-600">Top competitive programmers this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Rank</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Username</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Solved</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Level</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-200 last:border-0 transition-colors ${
                      entry.username === user?.username
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-sm">
                        {entry.rank <= 3 ? (["🥇", "🥈", "🥉"][entry.rank - 1]) : entry.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                          {entry.username[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {entry.username}
                          {entry.username === user?.username && (
                            <span className="text-xs bg-blue-100 text-blue-700 ml-2 px-2 py-1 rounded">You</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{entry.score.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{entry.solved}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        entry.level === "Expert"
                          ? "bg-red-100 text-red-700"
                          : entry.level === "Advanced"
                          ? "bg-orange-100 text-orange-700"
                          : entry.level === "Intermediate"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {entry.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
