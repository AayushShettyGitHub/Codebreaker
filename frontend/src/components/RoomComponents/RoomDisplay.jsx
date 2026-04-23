import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import { toastError, toastSuccess } from "../../utils/toast";
import { parseAsUTC } from "../../utils/dateUtils";
import { Users, Clock, Crown, LogOut, UserX, ChevronDown, ChevronRight, Copy, X, Code2, Trophy } from "lucide-react";
import Editor from "@monaco-editor/react";

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

  useEffect(() => {
    if (room?.currentProblem && !room?.problemStartTime) {
      fetchMyRoom();
    }
  }, [room?.currentProblem?.id, room?.problemStartTime, fetchMyRoom]);

  const isProblemActive = useMemo(() => {
    if (!room?.problemStartTime || !room?.problemDuration) return false;
    const startEpoch = parseAsUTC(room.problemStartTime);
    const endTime = startEpoch + room.problemDuration * 1000;
    return Date.now() < endTime;
  }, [room?.problemStartTime, room?.problemDuration]);

  useEffect(() => {
    if (!isProblemActive) { setTimeLeft(0); return; }
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
        fetchPlayers(room.id);
      }
    };
    websocketService.subscribe(`/topic/room/${room.id}`, handlePlayerUpdate);
    return () => websocketService.unsubscribe(`/topic/room/${room.id}`);
  }, [room?.id, fetchPlayers]);

  const [groupedProblems, setGroupedProblems] = useState([]);
  const [openProblems, setOpenProblems] = useState(() => JSON.parse(localStorage.getItem(`openProblems_${room?.id}`) || "{}"));
  const [expandedCodes, setExpandedCodes] = useState({});
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [showOnlyTopN, setShowOnlyTopN] = useState(2);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profilePlayer, setProfilePlayer] = useState(null);
  const [topSolutions, setTopSolutions] = useState([]);

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

  const closeProfile = () => { setProfileModalVisible(false); setProfilePlayer(null); };

  const fetchSubmissions = async () => {
    if (!room?.id) return;
    try {
      const res = await api.get(`/rooms/${room.id}/submissions`);
      let subs = res.data || [];
      subs = subs.filter(s => s.player?.player?.id === currentUser.id);
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
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        });
        const topSubmissions = sorted.slice(0, Math.max(2, showOnlyTopN));
        return { ...g, submissions: sorted, topSubmissions };
      }).sort((a, b) => a.problemTitle.localeCompare(b.problemTitle));
      setGroupedProblems(grouped);
    } catch (err) { console.error("Failed to fetch submissions:", err); }
  };

  const fetchTopSolutions = async () => {
    if (!room?.id || !room?.currentProblem?.id) return;
    try {
      const res = await api.get(`/rooms/${room.id}/top-solutions?problemId=${room.currentProblem.id}`);
      const sortedSolutions = (res.data || []).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setTopSolutions(sortedSolutions);
    } catch (err) {
      console.error("Failed to fetch top solutions:", err);
      setTopSolutions([]);
    }
  };

  useEffect(() => {
    if (!room?.id) return;
    fetchSubmissions();
    fetchTopSolutions();
    if (websocketService.isReady()) {
      const handler = (message) => {
        if (message.type === "PROBLEM_ENDED") {
          fetchSubmissions();
          fetchTopSolutions();
        }
      };
      websocketService.subscribe(`/topic/room/${room.id}`, handler);
      return () => websocketService.unsubscribe(`/topic/room/${room.id}`);
    }
  }, [room?.id, showOnlyTopN, isProblemActive]);

  useEffect(() => {
    if (!isProblemActive && room?.id) {
      fetchSubmissions();
      fetchTopSolutions();
    }
  }, [isProblemActive, room?.id]);

  useEffect(() => { localStorage.setItem(`openProblems_${room?.id}`, JSON.stringify(openProblems)); }, [openProblems, room?.id]);

  const toggleProblemOpen = (problemId) => setOpenProblems(prev => ({ ...prev, [problemId]: !prev[problemId] }));
  const toggleCodeExpanded = (submissionId) => setExpandedCodes(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  const openCodeModal = (submission) => { setModalContent(submission); setCodeModalVisible(true); };

  const leaderboard = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => {
      const scoreA = a.score ?? 0; const scoreB = b.score ?? 0;
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
      try { const { getErrorMessage } = await import("../../utils/errors"); toastError(getErrorMessage(err)); }
      catch (e) { toastError("Failed to remove player"); }
    }
  };

  const getMonacoLanguage = (lang) => {
    const map = { python: "python", javascript: "javascript", java: "java", cpp: "cpp", c: "c" };
    return map[lang] || "plaintext";
  };

  if (!room) return <div className="text-center p-6 text-red-400 text-sm font-medium">Room no longer exists</div>;

  if (kickedOut) {
    return (
      <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-md flex items-center justify-center z-50">
        <div className="rounded-xl border border-red-500/30 bg-[#0f0f13] p-8 max-w-sm text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
            <UserX size={24} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-[#e4e4e7] mb-2">Removed from Room</h2>
          <p className="text-sm text-[#71717a] mb-6">You have been removed from this room.</p>
          <button
            onClick={() => { setKickedOut(false); navigate("/home"); }}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all"
          >OK</button>
          <p className="text-xs text-[#3f3f46] mt-4">Redirecting in 3 seconds...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "leaderboard", label: "Leaderboard" },
    { key: "players", label: "Players" },
    { key: "problem", label: "Problem" },
    { key: "top_solutions", label: "Top Solutions" },
    { key: "my_submissions", label: "My Submissions" },
  ];

  return (
    <div className="rounded-xl border border-[#1c1c22] bg-[#0f0f13] overflow-hidden flex flex-col h-full animate-in">
      <div className="px-5 py-4 bg-[#141419] border-b border-[#1c1c22]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[#e4e4e7] truncate">{room.name}</h2>
          {isProblemActive && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-semibold ${timeLeft <= 30 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-[#0f0f13] text-[#e4e4e7] border border-[#1c1c22]"}`}>
              <Clock size={12} className={timeLeft <= 30 ? "text-red-400" : "text-[#71717a]"} />
              <span>
                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#71717a]">
            Host: <span className="text-[#a1a1aa] font-medium">{room.admin?.username}</span>
          </p>
          <span className="text-xs text-[#3f3f46] font-mono">#{room.id}</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#1c1c22] bg-[#09090b] overflow-x-auto custom-scrollbar-h">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-xs font-medium transition-all border-b-2 whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-2 ${activeTab === tab.key
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
              : "border-transparent text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#141419]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {activeTab === "leaderboard" && (
          <div className="animate-in space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: 'Players', v: players?.length || 0 },
                { l: 'Max', v: room?.maxCorrectAnswers || 0 },
                { l: 'Solved', v: players?.filter(p => p?.hasAnsweredCorrectly)?.length || 0 }
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#141419] border border-[#1c1c22] text-center">
                  <p className="text-[10px] text-[#71717a] mb-0.5">{s.l}</p>
                  <p className="text-lg font-bold text-[#e4e4e7]">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {leaderboard.map((player, index) => {
                const isCurrentUser = currentUser?.id === player.id;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrentUser
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "bg-[#141419] border border-[#1c1c22] hover:border-[#27272a]"
                      }`}
                  >
                    <div className={`text-xs font-bold w-6 text-center ${isCurrentUser ? "text-indigo-400" : "text-[#3f3f46]"}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate flex items-center gap-2 ${isCurrentUser ? "text-indigo-300" : "text-[#e4e4e7]"}`}>
                        {player.username}
                        {player.id === room?.admin?.id && <Crown size={12} className="text-indigo-400 opacity-80" />}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[#e4e4e7]">{player.score ?? 0}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div className="animate-in space-y-2">
            {players?.map((player) => {
              const isCurrentUser = currentUser?.id === player.id;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#141419] border border-[#1c1c22] hover:border-[#27272a] transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <button onClick={() => openProfile(player.id)} className="text-sm font-medium text-[#e4e4e7] hover:text-indigo-400 transition-colors truncate flex items-center gap-2">
                      {player.username}
                      {player.id === room.admin?.id && <Crown size={12} className="text-indigo-400" />}
                    </button>
                    <p className="text-xs text-[#71717a] mt-0.5">{player.role ?? "Participant"}</p>
                  </div>

                  {(isCurrentUser || isAdmin) && (
                    <button
                      className="text-xs px-3 py-1.5 rounded-md border border-[#1c1c22] text-[#71717a] hover:text-red-400 hover:border-red-500/30 transition-all"
                      onClick={() => handleLeavePlayer(player.id)}
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
          <div className="animate-in space-y-4">
            {room.currentProblem ? (
              <div className="space-y-4">
                <div className="p-5 rounded-lg bg-[#141419] border border-[#1c1c22]">
                  <h3 className="text-base font-semibold text-[#e4e4e7] mb-3">{room.currentProblem.title}</h3>
                  <div className="text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">{room.currentProblem.description}</div>
                </div>

                {room.currentProblem.testCases && room.currentProblem.testCases.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#71717a] uppercase tracking-wider">Example Test Cases</h4>
                    <div className="grid gap-3">
                      {room.currentProblem.testCases.filter(tc => !tc.hidden).slice(0, 2).map((tc, idx) => (
                        <div key={tc.id} className="p-4 rounded-lg bg-[#09090b] border border-[#1c1c22] space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3 rounded-full bg-indigo-500"></div>
                            <p className="text-xs font-medium text-[#e4e4e7]">Example {idx + 1}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] text-[#3f3f46] uppercase mb-1.5 font-bold">Input</p>
                              <pre className="p-2.5 rounded bg-[#141419] border border-[#1c1c22] text-xs text-[#a1a1aa] font-mono whitespace-pre-wrap">{tc.input}</pre>
                            </div>
                            <div>
                              <p className="text-[10px] text-[#3f3f46] uppercase mb-1.5 font-bold">Output</p>
                              <pre className="p-2.5 rounded bg-[#141419] border border-[#1c1c22] text-xs text-[#a1a1aa] font-mono whitespace-pre-wrap">{tc.output}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isProblemActive ? (
                  <div className={`p-4 rounded-lg text-center ${timeLeft <= 30 ? "bg-red-500/10 border border-red-500/20" : "bg-[#141419] border border-[#1c1c22]"}`}>
                    <p className="text-xs text-[#71717a] mb-1">Time Left</p>
                    <p className={`text-2xl font-bold font-mono ${timeLeft <= 30 ? "text-red-400" : "text-[#e4e4e7]"}`}>
                      {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                      {(timeLeft % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                ) : room.problemStartTime && (
                  <div className="p-4 rounded-lg bg-[#141419] border border-[#1c1c22] text-center">
                    <p className="text-sm text-[#71717a]">Problem Ended</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1c1c22] bg-[#141419]">
                <p className="text-sm text-[#3f3f46]">Waiting for problem...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "top_solutions" && (
          <div className="animate-in space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1c1c22]">
              <Trophy size={14} className="text-yellow-500" />
              <p className="text-xs font-bold text-[#e4e4e7] uppercase tracking-wider">Top Solutions</p>
            </div>

            {isProblemActive ? (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1c1c22] bg-[#141419]">
                <Trophy size={28} className="text-[#3f3f46] mx-auto mb-3" />
                <p className="text-sm text-[#3f3f46]">Solutions will appear after the round ends.</p>
              </div>
            ) : topSolutions.length === 0 ? (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1c1c22] bg-[#141419]">
                <p className="text-sm text-[#3f3f46]">No successful solutions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSolutions.map((sub, i) => (
                  <div key={sub.id} className="p-4 rounded-lg bg-[#141419] border border-[#1c1c22] hover:border-green-500/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          i === 1 ? "bg-gray-400/20 text-gray-300" :
                            "bg-orange-500/20 text-orange-400"
                          }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#e4e4e7]">{sub.player?.player?.username}</p>
                          <p className="text-[10px] text-[#71717a] uppercase">{sub.language}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-green-500/10 text-green-400">Passed</span>
                    </div>
                    <button
                      onClick={() => openCodeModal(sub)}
                      className="w-full py-2.5 rounded-lg border border-green-500/20 text-xs font-semibold text-green-400 hover:bg-green-500/10 transition-all"
                    >
                      View Solution
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "my_submissions" && (
          <div className="animate-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c22]">
              <p className="text-xs font-medium text-[#71717a]">Your Submission History</p>
              <button onClick={() => setShowOnlyTopN(prev => prev === 2 ? 5 : 2)} className="text-xs px-2 py-1 rounded-md border border-[#1c1c22] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#27272a] transition-all">
                Limit: {showOnlyTopN}
              </button>
            </div>

            <div className="space-y-3">
              {groupedProblems.length === 0 && (
                <div className="text-center py-16 rounded-lg border border-dashed border-[#1c1c22] bg-[#141419]">
                  <p className="text-sm text-[#3f3f46]">No history found.</p>
                </div>
              )}

              {groupedProblems.map((group) => (
                <div key={group.problemId} className="space-y-2">
                  <button
                    className="flex items-center justify-between w-full text-left px-3 py-2 rounded-lg hover:bg-[#141419] transition-all group"
                    onClick={() => toggleProblemOpen(group.problemId)}
                  >
                    <span className="text-sm font-medium text-[#e4e4e7] group-hover:text-indigo-400 transition-colors">{group.problemTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#3f3f46]">{group.submissions.length} submission(s)</span>
                      {openProblems[group.problemId] ? <ChevronDown size={14} className="text-[#3f3f46]" /> : <ChevronRight size={14} className="text-[#3f3f46]" />}
                    </div>
                  </button>

                  {openProblems[group.problemId] && (
                    <div className="pl-3 border-l-2 border-indigo-500/20 space-y-2 ml-2">
                      {group.topSubmissions.slice(0, showOnlyTopN).map(sub => (
                        <div key={sub.id} className="p-3 rounded-lg bg-[#141419] border border-[#1c1c22]">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-[#e4e4e7]">{sub.player?.player?.username || "Unknown"}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${sub.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                              {sub.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                          <button onClick={() => openCodeModal(sub)} className="w-full py-2 rounded-md border border-[#1c1c22] text-xs text-[#a1a1aa] hover:text-[#e4e4e7] hover:border-[#27272a] transition-all">
                            View Code
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {codeModalVisible && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#09090b]/90 backdrop-blur-md p-4">
          <div className="rounded-xl border border-[#1c1c22] bg-[#0f0f13] w-full max-w-4xl shadow-2xl overflow-hidden animate-in" style={{ height: "75vh" }}>
            <div className="flex items-center justify-between px-6 py-4 bg-[#141419] border-b border-[#1c1c22] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center">
                  <Code2 size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e4e4e7] leading-none">{modalContent?.player?.player?.username || "Submission"}</h3>
                  <p className="text-[10px] text-[#71717a] mt-1 uppercase tracking-wider">{modalContent?.language || "plain"} • Solution</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(modalContent?.code || ""); toastSuccess("Copied to clipboard!"); }}
                  className="px-4 py-2 rounded-lg border border-[#1c1c22] text-xs font-semibold text-[#a1a1aa] hover:text-[#e4e4e7] hover:border-red-500/30 transition-all flex items-center gap-2 bg-[#09090b]"
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={() => setCodeModalVisible(false)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ height: "calc(75vh - 64px)" }}>
              <Editor
                height="100%"
                language={getMonacoLanguage(modalContent?.language)}
                value={modalContent?.code || ""}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  lineNumbersMinChars: 3,
                  smoothScrolling: true,
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {profileModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#09090b]/90 backdrop-blur-md p-4">
          <div className="rounded-2xl border border-[#1c1c22] bg-[#0f0f13] w-full max-w-sm overflow-hidden shadow-2xl animate-in">
            <div className="h-20 bg-gradient-to-r from-indigo-900/40 to-black"></div>
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-10 left-6 p-1 bg-[#0f0f13] rounded-full">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {profilePlayer?.username?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="pt-12 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#e4e4e7]">{profilePlayer?.username}</h3>
                  <p className="text-xs text-[#71717a] font-medium uppercase tracking-wider">{profilePlayer?.role || 'Player'}</p>
                </div>
                <button onClick={closeProfile} className="p-2 -mr-2 text-[#3f3f46] hover:text-red-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-8">
                <h5 className="text-[10px] font-bold text-[#3f3f46] uppercase tracking-widest border-b border-[#1c1c22] pb-2 mb-4">Achievements</h5>
                <div className="grid grid-cols-1 gap-2">
                  {(!profilePlayer?.badges || profilePlayer.badges.length === 0) ? (
                    <p className="text-xs text-[#3f3f46] py-4 text-center italic">No badges earned yet.</p>
                  ) : (
                    profilePlayer.badges.map((b) => (
                      <div key={b.key} className="flex items-center gap-3 p-3 rounded-xl bg-[#141419]/50 border border-[#1c1c22] group hover:border-red-500/20 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-sm">
                          {b.key === 'first_solve' ? '🥇' : b.key === 'top_3' ? '⭐' : '◈'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#e4e4e7] truncate">{b.name}</p>
                          <p className="text-[9px] text-[#71717a] font-medium uppercase">{b.rank}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={closeProfile}
                className="w-full mt-6 py-2.5 rounded-xl bg-[#141419] border border-[#1c1c22] text-[#e4e4e7] text-xs font-bold hover:bg-red-600 hover:border-red-600 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
