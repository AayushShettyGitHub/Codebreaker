import { useEffect, useMemo, useState } from "react";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";

export default function RoomDisplay({ currentUser, onLeave = null }) {
  const { myRoom, players, setMyRoom, fetchPlayers } = useRoom();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeLeft, setTimeLeft] = useState(0);
  const room = myRoom;
  const isAdmin = room?.admin?.id === currentUser?.id;

  const isProblemActive = useMemo(() => {
    if (!room?.problemStartTime || !room?.problemDuration) return false;
    const endTime = new Date(room.problemStartTime).getTime() + room.problemDuration * 1000;
    return Date.now() < endTime;
  }, [room?.problemStartTime, room?.problemDuration]);

  useEffect(() => {
    if (!isProblemActive) {
      setTimeLeft(0);
      return;
    }
    const endTime = new Date(room.problemStartTime).getTime() + room.problemDuration * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [isProblemActive, room?.problemStartTime, room?.problemDuration]);

  const leaderboard = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.username ?? "").localeCompare(b.username ?? "");
    });
  }, [players]);

  const handleLeavePlayer = async (playerId) => {
    if (!room) return;

    try {
      if (playerId === currentUser.id) {
        await api.post(`/rooms/me/leave`);
        setMyRoom(null);
        onLeave?.();
      } else if (isAdmin) {
        await api.post(`/rooms/${room.id}/leave`, { playerId });
        // Fetch updated room and players
        const roomRes = await api.get(`/rooms/${room.id}`);
        setMyRoom(roomRes.data);
        // Fetch updated players list
        await fetchPlayers(room.id);
      }
    } catch (err) {
      console.error("Failed to leave/remove player:", err);
      alert("Failed to remove player: " + (err.response?.data?.message || err.message));
    }
  };

  if (!room) {
    return <div className="text-center p-4 font-semibold text-red-400">❌ Room no longer exists</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-5">
        <h2 className="text-xl font-bold text-white mb-2">{room.name}</h2>
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-400">Admin: <span className="text-cyan-400 font-semibold">{room.admin?.username}</span></p>
          <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">ID: {room.id}</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-700/50 bg-slate-800/30 px-4 py-3 overflow-x-auto">
        {[
          { key: "leaderboard", label: "🏆 Leaderboard" },
          { key: "players", label: "👥 Players" },
          { key: "problem", label: "📝 Problem" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all rounded-lg ${
              activeTab === tab.key 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {activeTab === "leaderboard" && (
          <div>
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Total Players</p>
                  <p className="text-2xl font-bold text-cyan-400">{players?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Max Answers</p>
                  <p className="text-2xl font-bold text-emerald-400">{room?.maxCorrectAnswers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Solved</p>
                  <p className="text-2xl font-bold text-orange-400">{players?.filter(p => p.hasAnsweredCorrectly)?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-400 font-semibold mb-4">🏆 Rankings</div>
            {leaderboard.length === 0 && <div className="text-slate-500 text-center py-8">👥 No players yet</div>}
            {leaderboard.map((player, index) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all mb-3 ${
                    isCurrentUser 
                      ? "bg-cyan-500/10 border-cyan-500/50 hover:border-cyan-400" 
                      : "bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50"
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white text-sm group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">
                      {player.username}
                      {player.id === room.admin?.id && " 👑"}
                      {isCurrentUser && " (You)"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-cyan-400">{player.score ?? 0}</p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "players" && (
          <div>
            <div className="text-sm text-slate-400 font-semibold mb-4">Participants ({players?.length || 0})</div>
            {players?.length === 0 && <div className="text-slate-500 text-center py-8">👥 No players in room</div>}
            {players?.map((player) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all mb-3"
                >
                  <div>
                    <p className="text-white font-bold flex items-center gap-2">
                      {player.username}
                      {player.id === room.admin?.id && "👑"}
                      {isCurrentUser && " (You)"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{player.role ?? "Participant"}</p>
                  </div>

                  {(isCurrentUser || isAdmin) && (
                    <button
                      className="text-xs px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all font-semibold"
                      onClick={() => handleLeavePlayer(player.id)}
                      title={isCurrentUser || isAdmin ? "Leave / Remove player" : "Not allowed"}
                    >
                      {isCurrentUser ? "🚪 Leave" : "✕ Remove"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "problem" && (
          <div className="space-y-4">
            {room.currentProblem ? (
              <>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{room.currentProblem.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{room.currentProblem.description}</p>
                    </div>
                    {isProblemActive && (
                      <div className={`text-center px-4 py-2 rounded-lg font-mono font-bold ${timeLeft <= 30 ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                        <div className="text-2xl">
                          {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                          {(timeLeft % 60).toString().padStart(2, "0")}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">remaining</p>
                      </div>
                    )}
                  </div>
                </div>
                {!isProblemActive && room.problemStartTime && (
                  <div className="text-sm text-amber-400 font-bold bg-amber-600/10 px-4 py-3 rounded-lg border border-amber-500/30 flex items-center gap-2">
                    <span>⏹️</span> Problem ended. Waiting for next round.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">📋 No active problem yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
