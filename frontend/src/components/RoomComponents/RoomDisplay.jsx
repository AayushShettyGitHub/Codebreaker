import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import { toastError, toastSuccess } from "../../utils/toast";

export default function RoomDisplay({ currentUser, onLeave = null }) {
  const { myRoom, players, setMyRoom, fetchPlayers, kickedOut, setKickedOut } = useRoom();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [timeLeft, setTimeLeft] = useState(0);
  const room = myRoom;
  const isAdmin = room?.admin?.id === currentUser?.id;

  useEffect(() => {
    if (kickedOut) {
      const timer = setTimeout(() => {
        setKickedOut(false);
        navigate("/home");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [kickedOut, setKickedOut, navigate]);

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

  useEffect(() => {
    if (!room?.id || !websocketService.isReady()) return;

    const handlePlayerUpdate = (message) => {
      if (message.type === "PLAYERS_UPDATED" || message.type === "SCORE_UPDATE") {
        console.log("Players updated via WebSocket");
        fetchPlayers(room.id);
      }
    };

    websocketService.subscribe(`/topic/room/${room.id}`, handlePlayerUpdate);

    return () => {
      websocketService.unsubscribe(`/topic/room/${room.id}`);
    };
  }, [room?.id, fetchPlayers]);

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
        await fetchPlayers(room.id);
      }
    } catch (err) {
      console.error("Failed to leave/remove player:", err);
      
      let errorMsg = "Failed to remove player";
      
      if (err.response?.status === 409) {
        errorMsg = "Room is locked or has active competition. Try again after the problem ends.";
      } else if (err.response?.status === 403) {
        errorMsg = "You don't have permission to remove this player";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toastError(errorMsg);
    }
  };

  if (!room) {
    return <div className="text-center p-4 font-semibold text-red-400 text-sm md:text-base">❌ Room no longer exists</div>;
  }

  if (kickedOut) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white border-2 border-red-500 rounded-lg p-8 max-w-sm text-center shadow-xl">
          <div className="text-4xl mb-4">👢</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">You have been kicked!</h2>
          <p className="text-gray-700 mb-6">You have been removed from the room.</p>
          <button
            onClick={() => {
              setKickedOut(false);
              navigate("/home");
            }}
            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all"
          >
            OK
          </button>
          <p className="text-xs text-gray-500 mt-4">Redirecting in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-2xl md:rounded-3xl overflow-hidden flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 px-4 md:px-6 py-4 md:py-5">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{room.name}</h2>
        <div className="flex items-center justify-between text-xs md:text-sm gap-2">
          <p className="text-gray-600">Admin: <span className="text-gray-900 font-semibold">{room.admin?.username}</span></p>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 md:px-3 py-1 rounded-lg border border-gray-300">ID: {room.id}</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-3 md:px-4 py-2 md:py-3 overflow-x-auto">
        {[
          { key: "leaderboard", label: "🏆 Leaderboard" },
          { key: "players", label: "👥 Players" },
          { key: "problem", label: "📝 Problem" },
          { key: "solutions", label: "💡 Top Solutions" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 md:px-4 py-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all rounded-lg ${
              activeTab === tab.key 
                ? "bg-gray-900 text-white shadow-lg" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 bg-white">
        {activeTab === "leaderboard" && (
          <div>
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl">
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Total Players</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{players?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Max Answers</p>
                  <p className="text-xl md:text-2xl font-bold text-emerald-600">{room?.maxCorrectAnswers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Solved</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-600">{players?.filter(p => p.hasAnsweredCorrectly)?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="text-xs md:text-sm text-gray-700 font-semibold mb-3 md:mb-4">🏆 Rankings</div>
            {leaderboard.length === 0 && <div className="text-gray-500 text-center py-8 text-sm">👥 No players yet</div>}
            {leaderboard.map((player, index) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className={`group flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg md:rounded-xl border-2 transition-all mb-2 md:mb-3 ${
                    isCurrentUser 
                      ? "bg-blue-50 border-blue-300 hover:border-blue-400" 
                      : "bg-gray-100 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-900 font-bold text-white text-xs md:text-sm group-hover:scale-110 transition-transform flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold text-xs md:text-base truncate">
                      {player.username}
                      {player.id === room.admin?.id && " 👑"}
                      {isCurrentUser && " (You)"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg md:text-xl font-bold text-gray-900">{player.score ?? 0}</p>
                    <p className="text-xs text-gray-500">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "players" && (
          <div>
            <div className="text-xs md:text-sm text-gray-700 font-semibold mb-3 md:mb-4">Participants ({players?.length || 0})</div>
            {players?.length === 0 && <div className="text-gray-500 text-center py-8 text-sm">👥 No players in room</div>}
            {players?.map((player) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-3 md:px-4 py-3 rounded-lg md:rounded-xl bg-gray-100 border border-gray-300 hover:border-blue-500 transition-all mb-2 md:mb-3 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 font-bold flex items-center gap-1 text-xs md:text-base truncate">
                      {player.username}
                      {player.id === room.admin?.id && "👑"}
                      {isCurrentUser && " (You)"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{player.role ?? "Participant"}</p>
                  </div>

                  {(isCurrentUser || isAdmin) && (
                    <button
                      className="text-xs px-2 md:px-3 py-1.5 md:py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all font-semibold whitespace-nowrap flex-shrink-0"
                      onClick={() => handleLeavePlayer(player.id)}
                      title={isCurrentUser ? "Leave room" : "Kick player"}
                    >
                      {isCurrentUser ? "🚪 Leave" : "👢 Kick"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "problem" && (
          <div className="space-y-3 md:space-y-4">
            {room.currentProblem ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg md:rounded-xl p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 break-words">{room.currentProblem.title}</h3>
                      <p className="text-xs md:text-sm text-gray-700 leading-relaxed">{room.currentProblem.description}</p>
                    </div>
                    {isProblemActive && (
                      <div className={`text-center px-3 md:px-4 py-2 rounded-lg font-mono font-bold whitespace-nowrap flex-shrink-0 ${timeLeft <= 30 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        <div className="text-lg md:text-2xl">
                          {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                          {(timeLeft % 60).toString().padStart(2, "0")}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">remaining</p>
                      </div>
                    )}
                  </div>
                </div>
                {!isProblemActive && room.problemStartTime && (
                  <div className="text-xs md:text-sm text-amber-700 font-bold bg-amber-100 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-amber-300 flex items-center gap-2">
                    <span>⏹️</span> Problem ended. Waiting for next round.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-500 text-xs md:text-sm">📋 No active problem yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "solutions" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">💡 Top Solutions</p>
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">Solutions will appear here after the problem ends.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
