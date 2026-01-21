import { useEffect, useMemo, useState } from "react";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import Submit from "./Submit";

export default function AdminRoom({ adminId, playerId, onDelete }) {
  const { myRoom, players, setMyRoom } = useRoom();
  const roomId = myRoom?.id;

  const [activeTab, setActiveTab] = useState("problem");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
  const [maxCorrectAnswers, setMaxCorrectAnswers] = useState(1);
  const [timerDuration, setTimerDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [topSubmissions, setTopSubmissions] = useState([]);
  const [copied, setCopied] = useState(false);
  const [roomCode, setRoomCode] = useState("");

  const isProblemActive = useMemo(() => {
    if (!myRoom?.problemStartTime || !myRoom?.problemDuration) return false;
    const end =
      new Date(myRoom.problemStartTime).getTime() +
      myRoom.problemDuration * 1000;
    return Date.now() < end;
  }, [myRoom?.problemStartTime, myRoom?.problemDuration]);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        if (active) {
          setMyRoom(res.data);
          setRoomCode(res.data.joinCode || res.data.id);
        }
      } catch {}
    };
    fetchRoom();
    const interval = setInterval(fetchRoom, isProblemActive ? 5000 : 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomId, setMyRoom, isProblemActive]);

  useEffect(() => {
    if (!roomId || isProblemActive) return;
    const fetchTopSubmissions = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/submissions`);
        const problemId = myRoom?.currentProblem?.id;
        const filtered = problemId ? res.data.filter(sub => sub.problem?.id === problemId) : res.data;
        const sorted = filtered.sort((a, b) => b.id - a.id).slice(0, 3);
        setTopSubmissions(sorted);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      }
    };
    fetchTopSubmissions();
    
    if (websocketService.isReady()) {
      const handleSubmissionResult = (message) => {
        if (message.type === "SUBMISSION_RESULT") {
          console.log("New submission result:", message);
          fetchTopSubmissions();
        }
      };
      
      websocketService.subscribe(`/topic/room/${roomId}`, handleSubmissionResult);
      
      return () => {
        websocketService.unsubscribe(`/topic/room/${roomId}`);
      };
    }
  }, [roomId, isProblemActive, myRoom?.currentProblem?.id]);

  useEffect(() => {
    if (myRoom?.maxCorrectAnswers) {
      setMaxCorrectAnswers(myRoom.maxCorrectAnswers);
    }
  }, [myRoom?.maxCorrectAnswers]);

  useEffect(() => {
    if (!isProblemActive) {
      setTimeLeft(0);
      return;
    }
    const endTime =
      new Date(myRoom.problemStartTime).getTime() +
      myRoom.problemDuration * 1000;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [isProblemActive, myRoom?.problemStartTime, myRoom?.problemDuration]);

  const addTestCase = () => setTestCases(prev => [...prev, { input: "", output: "" }]);
  const removeTestCase = index => {
    if (testCases.length > 1) setTestCases(prev => prev.filter((_, i) => i !== index));
  };
  const updateTestCase = (index, field, value) => {
    setTestCases(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handlePost = async () => {
    if (!roomId) return;
    if (!title.trim() || !description.trim()) return setMessage("Title and description required");
    if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) return setMessage("All test cases must be filled");
    if (timerDuration < 10) return setMessage("Timer must be at least 10 seconds");

    setLoading(true);
    try {
      const problemRes = await api.post(`/problems/${roomId}/with-test-cases`, {
        title,
        description,
        difficulty,
        testCases
      });

      await api.post(`/rooms/${roomId}/problem`, problemRes.data);

      await api.post(`/problems/rooms/${roomId}/start-problem`, { duration: timerDuration });

      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });

      setTitle("");
      setDescription("");
      setDifficulty("EASY");
      setTestCases([{ input: "", output: "" }]);
      setMessage("✅ New round started successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to post problem");
    } finally {
      setLoading(false);
    }
  };

  const handleSetMaxAnswers = async () => {
    if (!roomId || maxCorrectAnswers < 1) return;
    setLoading(true);
    try {
      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });
      setMessage("✅ Max answers updated");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("❌ Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roomId || !adminId) return;
    if (!window.confirm("Delete room for everyone?")) return;

    setLoading(true);
    try {
      await api.delete(`/rooms/${roomId}`, { data: { playerId: adminId } });
      setMyRoom(null);
      onDelete?.();
    } catch {
      setMessage("Failed to delete room");
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode?.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
      {message && (
        <div className="animate-pulse bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-emerald-500/30 px-6 py-3">
          <p className="text-emerald-300 font-medium text-sm">{message}</p>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Admin Panel</h2>
          {isProblemActive && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Time Left:</span>
              <div className={`font-mono font-bold text-lg px-4 py-1.5 rounded-lg ${timeLeft <= 30 ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700/50 bg-slate-800/30 px-6 py-3 overflow-x-auto">
        {[
          { key: "problem", label: "📝 Post Problem" },
          { key: "submit", label: "💻 Submit Code" },
          { key: "settings", label: "⚙️ Settings" },
          { key: "leaderboard", label: "🏆 Leaderboard" },
          { key: "solutions", label: "💡 Top Solutions" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all rounded-xl ${
              activeTab === tab.key 
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activeTab === "problem" && (
          <div className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Problem Title</label>
                <input
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Fibonacci Sequence"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Difficulty</label>
                <select
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="EASY">🟢 Easy</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HARD">🔴 Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Describe the problem..."
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-300">Test Cases</label>
                <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">{testCases.length} cases</span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto border border-slate-700/50 rounded-xl p-4 bg-slate-800/20">
                {testCases.map((tc, i) => (
                  <div key={i} className="border border-slate-700 rounded-xl p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-all">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Input #{i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs mt-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="Input"
                          rows={2}
                          value={tc.input}
                          onChange={e => updateTestCase(i, "input", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 font-semibold">Output #{i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs mt-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          placeholder="Output"
                          rows={2}
                          value={tc.output}
                          onChange={e => updateTestCase(i, "output", e.target.value)}
                        />
                      </div>
                    </div>
                    {testCases.length > 1 && (
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors font-semibold" onClick={() => removeTestCase(i)}>
                        ✕ Remove Case
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addTestCase}
                className="w-full px-4 py-3 mt-4 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-sm transition-all border border-slate-700"
              >
                + Add Test Case
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Duration (seconds)</label>
              <input
                type="number"
                min={10}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={timerDuration}
                onChange={e => setTimerDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Max Correct Answers</label>
              <input
                type="number"
                min={1}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={maxCorrectAnswers}
                onChange={e => setMaxCorrectAnswers(Number(e.target.value))}
                placeholder="Number of players who can solve"
              />
              <p className="text-xs text-slate-400 mt-2">How many players can get correct answers for this problem</p>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 text-sm"
                onClick={handlePost}
                disabled={loading}
              >
                {loading ? "⏳ Starting..." : "🚀 Start New Round"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "submit" && (
          <div>
            {myRoom?.currentProblem ? (
              <Submit
                roomId={roomId}
                playerId={playerId}
                problemId={myRoom.currentProblem?.id}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">⏹️ No active problem. Post one to start!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <span>📌</span> Share Room
              </h3>
              <p className="text-sm text-slate-400 mb-6">Share this code with players to join your competition</p>
              
              <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-6 mb-6">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">Room Join Code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-5 py-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 rounded-xl font-mono text-2xl font-bold text-cyan-400 text-center">
                    {roomCode}
                  </div>
                  <button
                    onClick={copyRoomCode}
                    className={`px-6 py-4 rounded-xl font-bold text-sm transition-all transform hover:scale-110 ${
                      copied
                        ? "bg-gradient-to-r from-emerald-500/40 to-teal-500/40 text-emerald-300 border-2 border-emerald-500/50"
                        : "bg-gradient-to-r from-blue-500/40 to-cyan-500/40 text-blue-300 border-2 border-blue-500/50 hover:from-blue-500/60 hover:to-cyan-500/60"
                    }`}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-300">
                <p className="font-semibold mb-2">💡 How to share:</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>• Copy the code above</li>
                  <li>• Share it with your players</li>
                  <li>• They can use it to join your room</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>⏱️</span> Problem Timer
              </h3>
              {isProblemActive ? (
                <div className="text-center">
                  <div className={`text-5xl font-mono font-bold mb-3 ${timeLeft <= 30 ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                  <p className="text-sm text-slate-400">Problem is active</p>
                </div>
              ) : (
                <p className="text-center text-red-400 font-semibold py-6">⏹️ No active problem</p>
              )}
            </div>

            <div className="border-t border-slate-700/50 pt-6">
              <button
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-red-500/50 text-sm"
                onClick={handleDelete}
                disabled={loading}
              >
                🗑️ Delete Room
              </button>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="max-w-3xl">
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Total Players</p>
                  <p className="text-2xl font-bold text-cyan-400">{players?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Max Answers</p>
                  <p className="text-2xl font-bold text-emerald-400">{myRoom?.maxCorrectAnswers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold mb-1">Solved</p>
                  <p className="text-2xl font-bold text-orange-400">{players?.filter(p => p.hasAnsweredCorrectly)?.length || 0}</p>
                </div>
              </div>
            </div>
            {players?.length > 0 ? (
              <div className="space-y-3">
                {players
                  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                  .map((player, idx) => (
                    <div
                      key={player.id}
                      className="group flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold flex items-center gap-2">{player.username} {player.hasAnsweredCorrectly && "✅"}</p>
                        <p className="text-xs text-slate-400">{player.id === myRoom.admin?.id ? "👑 Admin" : "Participant"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-cyan-400">{player.score ?? 0}</p>
                        <p className="text-xs text-slate-500">/ {myRoom.maxCorrectAnswers}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">👥 No players yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "solutions" && (
          <div className="max-w-4xl">
            {!isProblemActive ? (
              <>
                <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg">
                  <p className="text-sm font-semibold text-slate-300">
                    {topSubmissions?.length > 0 ? `📊 Top ${topSubmissions.length} Submissions` : "📊 No submissions yet"}
                  </p>
                  {topSubmissions?.length > 0 && myRoom?.currentProblem && (
                    <p className="text-xs text-slate-400 mt-1">Problem: {myRoom.currentProblem.title}</p>
                  )}
                </div>
                {topSubmissions?.length > 0 ? (
                  <div className="space-y-4">
                {topSubmissions.map((sub, idx) => (
                  <div key={sub.id} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900/40 hover:border-cyan-500/70 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                    <div className={`px-5 py-4 border-b border-slate-700 ${sub.passed ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 font-bold text-white text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-white font-bold">{sub.player?.username || "Unknown"}</p>
                            <p className="text-xs text-slate-400">{sub.language?.toUpperCase() || "N/A"} • {new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${sub.passed ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50" : "bg-red-500/30 text-red-300 border border-red-500/50"}`}>
                          {sub.passed ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="bg-slate-950/60 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-700/50">
                          <span className="text-xs font-semibold text-slate-400">CODE</span>
                          <span className="text-xs text-slate-500">{sub.code?.length || 0} characters</span>
                        </div>
                        <pre className="p-4 text-slate-300 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed max-h-72 overflow-auto">{sub.code}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-slate-500 text-sm font-medium">💤 Waiting for submissions...</p>
                    <p className="text-slate-600 text-xs mt-2">Solutions will appear here after the timer ends</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">⏱️ Solutions will be revealed after timer ends</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
