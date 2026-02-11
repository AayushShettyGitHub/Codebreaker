import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import { toastError, toastSuccess } from "../../utils/toast";
import { parseAsUTC } from "../../utils/dateUtils";

export default function RoomDisplay({ currentUser, onLeave = null }) {
  const { myRoom, players, setMyRoom, fetchPlayers, fetchMyRoom, kickedOut, setKickedOut } = useRoom();
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

  // Ensure we have timer data when problem starts
  useEffect(() => {
    if (room?.currentProblem && !room?.problemStartTime) {
      // Problem exists but missing timer data - fetch fresh room data
      fetchMyRoom();
    }
  }, [room?.currentProblem?.id, room?.problemStartTime, fetchMyRoom]);

  const isProblemActive = useMemo(() => {
    if (!room?.problemStartTime || !room?.problemDuration) {
      console.log("Timer check: Missing timer data", {
        problemStartTime: room?.problemStartTime,
        problemDuration: room?.problemDuration
      });
      return false;
    }

    // Backend now returns Instant (ISO 8601 string) which already contains timezone info (Z).
    // e.g., "2023-10-27T10:00:00Z"
    // Backend now returns Instant. Ensure it is treated as UTC.
    // robustly append Z if missing, just in case.
    const startEpoch = parseAsUTC(room.problemStartTime);
    const endTime = startEpoch + room.problemDuration * 1000;
    const now = Date.now();
    const isActive = now < endTime;

    console.log("TIMER_DEBUG_V3:", {
      rawString: room?.problemStartTime,
      parsedStart: new Date(startEpoch).toLocaleString(), // Local representation of the Start Time
      computedEnd: new Date(endTime).toLocaleString(),
      clientNow: new Date(now).toLocaleString(), // Local representation of Client Time
      diffSeconds: Math.floor((endTime - now) / 1000),
      isActive
    });

    return isActive;
  }, [room?.problemStartTime, room?.problemDuration]);

  useEffect(() => {
    if (!isProblemActive) {
      setTimeLeft(0);
      return;
    }
    const startEpoch = parseAsUTC(room.problemStartTime);
    const endTime = startEpoch + room.problemDuration * 1000;
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

  const [groupedProblems, setGroupedProblems] = useState([]);
  const [openProblems, setOpenProblems] = useState(() => JSON.parse(localStorage.getItem(`openProblems_${room?.id}`) || "{}"));
  const [expandedCodes, setExpandedCodes] = useState({});
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [panelCollapsed, setPanelCollapsed] = useState(() => JSON.parse(localStorage.getItem(`solutionsPanelCollapsed_${room?.id}`) || "false"));
  const [showOnlyTopN, setShowOnlyTopN] = useState(2);

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profilePlayer, setProfilePlayer] = useState(null);

  const openProfile = async (playerId) => {
    try {
      const res = await api.get(`/players/${playerId}`);
      setProfilePlayer(res.data || null);
      setProfileModalVisible(true);
    } catch (err) {
      console.error('Failed to load player profile', err);
      toastError('Failed to load profile');
    }
  };

  const closeProfile = () => {
    setProfileModalVisible(false);
    setProfilePlayer(null);
  };

  const fetchSubmissions = async () => {
    if (!room?.id) return;
    try {
      const res = await api.get(`/rooms/${room.id}/submissions`);
      let subs = res.data || [];

      // Client-side safety: if a problem is currently active, remove any submissions
      // that belong to the active problem so solutions don't appear prematurely.
      if (isProblemActive && room?.currentProblem?.id) {
        const curId = room.currentProblem.id;
        subs = subs.filter(s => !(s.problem && s.problem.id === curId));
      }
      const groups = {};
      subs.forEach(s => {
        const pid = s.problem?.id || "unknown";
        if (!groups[pid]) groups[pid] = { problemId: pid, problemTitle: s.problem?.title || `Problem ${pid}`, submissions: [] };
        groups[pid].submissions.push(s);
      });

      const grouped = Object.values(groups).map(g => {
        const sorted = g.submissions.sort((a, b) => {
          if ((b.passed ? 1 : 0) !== (a.passed ? 1 : 0)) return (b.passed ? 1 : 0) - (a.passed ? 1 : 0);
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        });
        const topSubmissions = sorted.slice(0, Math.max(2, showOnlyTopN));
        return { ...g, submissions: sorted, topSubmissions };
      }).sort((a, b) => a.problemTitle.localeCompare(b.problemTitle));

      setGroupedProblems(grouped);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  useEffect(() => {
    if (!room?.id) return;
    fetchSubmissions();

    if (websocketService.isReady()) {
      const handler = (message) => {
        // Only refresh solutions when the problem ends to avoid showing partial solutions early
        if (message.type === "PROBLEM_ENDED") {
          fetchSubmissions();
        } else if (message.type === "SUBMISSION_RESULT") {
          // keep logging or notify users, but do not append solutions yet
          console.log("Submission result received (hidden until reveal):", message.result);
        }
      };
      websocketService.subscribe(`/topic/room/${room.id}`, handler);
      return () => websocketService.unsubscribe(`/topic/room/${room.id}`);
    }
  }, [room?.id, showOnlyTopN, isProblemActive]);

  // Refetch submissions when problem ends
  useEffect(() => {
    if (!isProblemActive && room?.id) {
      fetchSubmissions();
    }
  }, [isProblemActive, room?.id]);

  useEffect(() => {
    localStorage.setItem(`openProblems_${room?.id}`, JSON.stringify(openProblems));
  }, [openProblems, room?.id]);

  useEffect(() => {
    localStorage.setItem(`solutionsPanelCollapsed_${room?.id}`, JSON.stringify(panelCollapsed));
  }, [panelCollapsed, room?.id]);

  const toggleProblemOpen = (problemId) => {
    setOpenProblems(prev => ({ ...prev, [problemId]: !prev[problemId] }));
  };

  const expandAllGroup = (problemId) => {
    setOpenProblems(prev => ({ ...prev, [problemId]: true }));
  };

  const toggleCodeExpanded = (submissionId) => {
    setExpandedCodes(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  const openCodeModal = (submission) => {
    setModalContent(submission);
    setCodeModalVisible(true);
  };

  const leaderboard = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => {
      const scoreA = a.score ?? 0;
      const scoreB = b.score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (a.username ?? "").localeCompare(b.username ?? "");
    });
  }, [players]);

  const getBadgeColors = (rank) => {
    const r = (rank || '').toUpperCase();
    switch (r) {
      case 'GOLD': return { dot: 'bg-yellow-200', text: 'text-amber-900' };
      case 'DIAMOND': return { dot: 'bg-indigo-200', text: 'text-indigo-900' };
      case 'PLATINUM': return { dot: 'bg-slate-200', text: 'text-slate-900' };
      case 'SILVER': return { dot: 'bg-slate-200', text: 'text-slate-900' };
      case 'BRONZE': default: return { dot: 'bg-amber-200', text: 'text-amber-900' };
    }
  };

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

      // Prefer a clean, user-readable message (no HTTP status codes)
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        toastError(getErrorMessage(err));
      } catch (e) {
        toastError("Failed to remove player");
      }
    }
  };

  if (!room) {
    return <div className="text-center p-4 font-semibold text-red-400 text-sm md:text-base">Room no longer exists</div>;
  }

  if (kickedOut) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white border-2 border-red-500 rounded-lg p-8 max-w-sm text-center shadow-xl">
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
          <div className="flex items-center gap-2">
            {isProblemActive && (
              <div className={`text-center px-2 py-1 rounded-lg font-mono font-bold whitespace-nowrap ${timeLeft <= 30 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                <div className="text-sm md:text-base">
                  {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </div>
              </div>
            )}
            <span className="text-xs text-gray-600 bg-gray-100 px-2 md:px-3 py-1 rounded-lg border border-gray-300">ID: {room.id}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 bg-gray-50 px-3 md:px-4 py-2 md:py-3 overflow-x-auto">
        {[
          { key: "leaderboard", label: "Leaderboard" },
          { key: "players", label: "Players" },
          { key: "problem", label: "Problem" },
          { key: "solutions", label: "Top Solutions" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 md:px-4 py-2 font-medium text-xs md:text-sm whitespace-nowrap transition-all rounded-lg ${activeTab === tab.key
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
            <div className="text-xs md:text-sm text-gray-700 font-semibold mb-3 md:mb-4">Rankings</div>
            {leaderboard.length === 0 && <div className="text-gray-500 text-center py-8 text-sm">No players yet</div>}
            {leaderboard.map((player, index) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className={`group flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg md:rounded-xl border-2 transition-all mb-2 md:mb-3 ${isCurrentUser
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
                      {player.id === room.admin?.id && " (admin)"}
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
            {players?.length === 0 && <div className="text-gray-500 text-center py-8 text-sm">No players in room</div>}
            {players?.map((player) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between px-3 md:px-4 py-3 rounded-lg md:rounded-xl bg-gray-100 border border-gray-300 hover:border-blue-500 transition-all mb-2 md:mb-3 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900 font-bold flex items-center gap-1 text-xs md:text-base truncate">
                      <button onClick={() => openProfile(player.id)} className="text-left truncate font-semibold text-gray-900 hover:underline">
                        {player.username}
                      </button>
                      {player.id === room.admin?.id && "Admin"}
                      {isCurrentUser && " (You)"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{player.role ?? "Participant"}</p>

                    {/* badges under name (up to 3) */}
                    {player.badges && player.badges.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {player.badges.slice(0, 3).map((b, i) => {
                          const cols = getBadgeColors(b.rank);
                          return (
                            <div key={i} className="px-2 py-1 rounded-lg text-xs flex items-center gap-2 border border-gray-200 bg-gray-50">
                              <div className={`w-6 h-6 rounded-full ${cols.dot} flex items-center justify-center font-bold ${cols.text} text-xs`}>🏅</div>
                              <span className="font-semibold text-gray-900">{b.name}</span>
                              {b.count > 1 && <span className="ml-1 text-xs text-gray-500">x{b.count}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {(isCurrentUser || isAdmin) && (
                    <button
                      className="text-xs px-2 md:px-3 py-1.5 md:py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all font-semibold whitespace-nowrap flex-shrink-0"
                      onClick={() => handleLeavePlayer(player.id)}
                      title={isCurrentUser ? "Leave room" : "Kick player"}
                    >
                      {isCurrentUser ? "Leave" : "Kick"}
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
                    Problem ended. Waiting for next round.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-500 text-xs md:text-sm">No active problem yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "solutions" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-black mb-3">Top Solutions</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const key = `solutionsPanelCollapsed_${room.id}`;
                    const newVal = !JSON.parse(localStorage.getItem(key) || "false");
                    localStorage.setItem(key, JSON.stringify(newVal));
                    setPanelCollapsed(newVal);
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {panelCollapsed ? "Expand" : "Collapse"}
                </button>
                <button
                  onClick={() => {
                    setShowOnlyTopN(prev => prev === 2 ? 5 : 2);
                  }}
                  title="Toggle top N (2/5)"
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Top {showOnlyTopN}
                </button>
              </div>
            </div>

            {panelCollapsed ? (
              <div className="text-center py-6 text-sm text-gray-600">Solutions panel is collapsed. Click Expand to view.</div>
            ) : (
              <div>
                {groupedProblems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-black text-sm">Solutions will appear here after the problem ends.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {groupedProblems.map((group) => (
                    <div key={group.problemId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleProblemOpen(group.problemId)}
                            className="text-left text-sm font-semibold text-gray-900"
                          >
                            {group.problemTitle}
                          </button>
                          <span className="text-xs text-gray-500">• {group.submissions.length} submissions</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => expandAllGroup(group.problemId)}
                            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >
                            {openProblems[group.problemId] ? "Collapse" : "Expand"}
                          </button>
                        </div>
                      </div>

                      {openProblems[group.problemId] && (
                        <div className="mt-3 space-y-3">
                          {group.topSubmissions.slice(0, showOnlyTopN).map(sub => (
                            <div key={sub.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{sub.player?.player?.username || sub.player?.username || "Unknown"}</p>
                                    {sub.passed ? (
                                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Passed</span>
                                    ) : (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Failed</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-black mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleCodeExpanded(sub.id)}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
                                  >
                                    {expandedCodes[sub.id] ? "Hide Code" : "View Code"}
                                  </button>

                                  <button
                                    onClick={() => openCodeModal(sub)}
                                    className="text-xs px-2 py-1 bg-gray-900 text-white rounded-lg"
                                  >
                                    Expand
                                  </button>
                                </div>
                              </div>

                              {expandedCodes[sub.id] && (
                                <div className="mt-3 bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                                  <pre className="whitespace-pre-wrap break-words text-xs font-mono">{sub.code}</pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {codeModalVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{modalContent?.problem?.title || "Solution"}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        navigator.clipboard.writeText(modalContent?.code || "");
                        toastSuccess("Code copied to clipboard");
                      }} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg">Copy</button>
                      <button onClick={() => setCodeModalVisible(false)} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg">Close</button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm font-mono overflow-auto">
                    <pre className="whitespace-pre-wrap break-words">{modalContent?.code}</pre>
                  </div>
                </div>
              </div>
            )}

            {profileModalVisible && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{profilePlayer?.username || 'Profile'}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={closeProfile} className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 rounded-lg">Close</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 text-center">
                      <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl font-bold text-white">
                        {profilePlayer?.username?.[0]?.toUpperCase()}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">{profilePlayer?.username}</h4>
                      <p className="text-sm text-gray-600 mt-2">{profilePlayer?.role || 'Participant'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h5 className="text-lg font-semibold mb-3">Badges</h5>
                      {(!profilePlayer?.badges || profilePlayer.badges.length === 0) && (
                        <p className="text-gray-600">No badges yet.</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {profilePlayer?.badges?.map((b) => {
                          const cols = getBadgeColors(b.rank);
                          return (
                            <div key={b.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                              <div className={`w-12 h-12 rounded-full ${cols.dot} flex items-center justify-center font-bold ${cols.text}`}>🏅</div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{b.name} <span className="text-xs text-gray-500">{b.rank}</span></p>
                                <p className="text-xs text-gray-600">{b.description}</p>
                                {b.count > 1 && <p className="text-xs text-gray-500 mt-1">Activity count: {b.count}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
