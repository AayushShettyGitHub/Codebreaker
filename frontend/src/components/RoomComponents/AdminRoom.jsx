import { useEffect, useMemo, useState } from "react";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import Submit from "./Submit";
import { toastError, toastSuccess } from "../../utils/toast";
import { parseAsUTC } from "../../utils/dateUtils";

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
    const startEpoch = parseAsUTC(myRoom.problemStartTime);
    const end = startEpoch + myRoom.problemDuration * 1000;
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
      } catch { }
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
      console.log("No active problem, timer stopped");
      setTimeLeft(0);
      return;
    }
    const startEpoch = parseAsUTC(myRoom.problemStartTime);
    const endTime = startEpoch + myRoom.problemDuration * 1000;
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

      // Refetch room to ensure problem is persisted before starting
      const refreshedRoom = await api.get(`/rooms/${roomId}`);

      const startRes = await api.post(`/problems/rooms/${roomId}/start-problem`, { duration: timerDuration });

      // Fetch the fresh room data immediately to ensure timer is properly set
      const roomRes = await api.get(`/rooms/${roomId}`);
      setMyRoom(roomRes.data);

      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });

      setTitle("");
      setDescription("");
      setDifficulty("EASY");
      setTestCases([{ input: "", output: "" }]);
      setMessage("New round started successfully!");
      toastSuccess("New round started!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error during problem posting:", err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to post problem";
      console.error("Server error details:", serverMsg);
      setMessage(`${serverMsg}`);
      toastError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetMaxAnswers = async () => {
    if (!roomId || maxCorrectAnswers < 1) return;
    setLoading(true);
    try {
      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });
      setMessage("Max answers updated");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update");
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
    <div className="bg-white border border-gray-200 shadow-lg rounded-3xl overflow-hidden flex flex-col h-full">
      {message && (
        <div className="animate-pulse bg-blue-50 border-b border-blue-200 px-6 py-3">
          <p className="text-blue-700 font-medium text-sm">{message}</p>
        </div>
      )}

      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          {isProblemActive && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">Time Left:</span>
              <div className={`font-mono font-bold text-lg px-4 py-1.5 rounded-lg ${timeLeft <= 30 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 bg-gray-50 px-6 py-3 overflow-x-auto">
        {[
          { key: "problem", label: "Post Problem" },
          { key: "submit", label: "Submit Code" },
          { key: "settings", label: "Settings" },
          { key: "leaderboard", label: "Leaderboard" },
          { key: "solutions", label: "Top Solutions" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all rounded-xl ${activeTab === tab.key
              ? "bg-gray-900 text-white shadow-lg"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Problem Title</label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Fibonacci Sequence"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Difficulty</label>
                <select
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Describe the problem..."
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">Test Cases</label>
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{testCases.length} cases</span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto border border-gray-300 rounded-xl p-4 bg-gray-50">
                {testCases.map((tc, i) => (
                  <div key={i} className="border border-gray-300 rounded-xl p-4 bg-white hover:bg-gray-50 transition-all">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-600 font-semibold">Input #{i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-xs mt-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Input"
                          rows={2}
                          value={tc.input}
                          onChange={e => updateTestCase(i, "input", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 font-semibold">Output #{i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-xs mt-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Output"
                          rows={2}
                          value={tc.output}
                          onChange={e => updateTestCase(i, "output", e.target.value)}
                        />
                      </div>
                    </div>
                    {testCases.length > 1 && (
                      <button className="text-xs text-red-600 hover:text-red-700 transition-colors font-semibold" onClick={() => removeTestCase(i)}>
                        ✕ Remove Case
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addTestCase}
                className="w-full px-4 py-3 mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold text-sm transition-all border border-gray-300"
              >
                + Add Test Case
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Duration (seconds)</label>
              <input
                type="number"
                min={10}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={timerDuration}
                onChange={e => setTimerDuration(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Max Correct Answers</label>
              <input
                type="number"
                min={1}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={maxCorrectAnswers}
                onChange={e => setMaxCorrectAnswers(Number(e.target.value))}
                placeholder="Number of players who can solve"
              />
              <p className="text-xs text-gray-600 mt-2">How many players can get correct answers for this problem</p>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                className="flex-1 px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg transform hover:scale-105 text-sm"
                onClick={handlePost}
                disabled={loading}
              >
                {loading ? "Starting..." : "Start New Round"}
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
                <p className="text-gray-500 text-sm">No active problem. Post one to start!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span></span> Share Room
              </h3>
              <p className="text-sm text-gray-700 mb-6">Share this code with players to join your competition</p>

              <div className="bg-white border border-blue-300 rounded-2xl p-6 mb-6">
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-3">Room Join Code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-5 py-4 bg-blue-100 border-2 border-blue-300 rounded-xl font-mono text-2xl font-bold text-blue-700 text-center">
                    {roomCode}
                  </div>
                  <button
                    onClick={copyRoomCode}
                    className={`px-6 py-4 rounded-xl font-bold text-sm transition-all transform hover:scale-110 ${copied
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : "bg-gray-900 text-white border-2 border-gray-900 hover:bg-gray-800"
                      }`}
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-300 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-semibold mb-2">How to share:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Copy the code above</li>
                  <li>• Share it with your players</li>
                  <li>• They can use it to join your room</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span></span> Problem Timer
              </h3>
              {isProblemActive ? (
                <div className="text-center">
                  <div className={`text-5xl font-mono font-bold mb-3 ${timeLeft <= 30 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                    {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                  <p className="text-sm text-gray-700">Problem is active</p>
                </div>
              ) : (
                <p className="text-center text-red-600 font-semibold py-6">No active problem</p>
              )}
            </div>

            <div className="border-t border-gray-300 pt-6">
              <button
                className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-all shadow-lg text-sm"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Room
              </button>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="max-w-3xl">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-700 font-semibold mb-1">Total Players</p>
                  <p className="text-2xl font-bold text-blue-600">{players?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-700 font-semibold mb-1">Max Answers</p>
                  <p className="text-2xl font-bold text-emerald-600">{myRoom?.maxCorrectAnswers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-700 font-semibold mb-1">Solved</p>
                  <p className="text-2xl font-bold text-orange-600">{players?.filter(p => p.hasAnsweredCorrectly)?.length || 0}</p>
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
                      className="group flex items-center gap-4 bg-gray-50 border border-gray-300 rounded-xl p-4 hover:border-blue-500 transition-all hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 font-bold text-white text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-semibold flex items-center gap-2">{player.username}</p>
                        <p className="text-xs text-gray-600">{player.id === myRoom.admin?.id ? "Admin" : "Participant"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{player.score ?? 0}</p>
                        <p className="text-xs text-gray-600">/ {myRoom.maxCorrectAnswers}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm">No players yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "solutions" && (
          <div className="max-w-4xl">
            {!isProblemActive ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">
                    {topSubmissions?.length > 0 ? `Top ${topSubmissions.length} Submissions` : "No submissions yet"}
                  </p>
                  {topSubmissions?.length > 0 && myRoom?.currentProblem && (
                    <p className="text-xs text-gray-700 mt-1">Problem: {myRoom.currentProblem.title}</p>
                  )}
                </div>
                {topSubmissions?.length > 0 ? (
                  <div className="space-y-4">
                    {topSubmissions.map((sub, idx) => (
                      <div key={sub.id} className="border border-gray-300 rounded-2xl overflow-hidden bg-white hover:border-blue-500 transition-all hover:shadow-lg">
                        <div className={`px-5 py-4 border-b border-gray-300 ${sub.passed ? "bg-green-50" : "bg-red-50"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 font-bold text-white text-sm">
                                {idx + 1}
                              </div>
                              <div>
                                <p className="text-gray-900 font-bold">{sub.player?.username || "Unknown"}</p>
                                <p className="text-xs text-gray-700">{sub.language?.toUpperCase() || "N/A"} • {new Date(sub.submittedAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${sub.passed ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                              {sub.passed ? "✓ PASSED" : "✗ FAILED"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="bg-gray-50 rounded-xl border border-gray-300 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
                              <span className="text-xs font-semibold text-gray-700">CODE</span>
                              <span className="text-xs text-gray-700">{sub.code?.length || 0} characters</span>
                            </div>
                            <pre className="p-4 text-gray-900 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed max-h-72 overflow-auto">{sub.code}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-600 text-sm font-medium">💤 Waiting for submissions...</p>
                    <p className="text-gray-700 text-xs mt-2">Solutions will appear here after the timer ends</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-sm">Solutions will be revealed after timer ends</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
