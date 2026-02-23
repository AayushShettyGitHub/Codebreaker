import { useEffect, useMemo, useState } from "react";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import websocketService from "../../services/websocketService";
import Submit from "./Submit";
import { toastError, toastSuccess } from "../../utils/toast";
import { parseAsUTC } from "../../utils/dateUtils";
import ProblemLibrary from "./ProblemLibrary";
import { Settings, Trash2, Copy, Check, Clock, BookOpen, Code2, Trophy, FileText, Library, Crown } from "lucide-react";

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
  const [selectedLibraryId, setSelectedLibraryId] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [codeModalVisible, setCodeModalVisible] = useState(false);

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
        if (active) { setMyRoom(res.data); setRoomCode(res.data.joinCode || res.data.id); }
      } catch { }
    };
    fetchRoom();
    const interval = setInterval(fetchRoom, isProblemActive ? 15000 : 60000); 
    return () => { active = false; clearInterval(interval); };
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
      } catch (err) { console.error("Failed to fetch submissions:", err); }
    };
    fetchTopSubmissions();
    if (websocketService.isReady()) {
      const handleSubmissionResult = (message) => { if (message.type === "SUBMISSION_RESULT") fetchTopSubmissions(); };
      websocketService.subscribe(`/topic/room/${roomId}`, handleSubmissionResult);
      return () => websocketService.unsubscribe(`/topic/room/${roomId}`);
    }
  }, [roomId, isProblemActive, myRoom?.currentProblem?.id]);

  useEffect(() => { if (myRoom?.maxCorrectAnswers) setMaxCorrectAnswers(myRoom.maxCorrectAnswers); }, [myRoom?.maxCorrectAnswers]);

  useEffect(() => {
    if (!isProblemActive) { setTimeLeft(0); return; }
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
  const removeTestCase = index => { if (testCases.length > 1) setTestCases(prev => prev.filter((_, i) => i !== index)); };
  const updateTestCase = (index, field, value) => {
    setTestCases(prev => { const copy = [...prev]; copy[index] = { ...copy[index], [field]: value }; return copy; });
  };

  const handlePost = async () => {
    if (!roomId) return;
    if (!title.trim() || !description.trim()) return setMessage("Title and description required");
    if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) return setMessage("All test cases must be filled");
    if (timerDuration < 10) return setMessage("Timer must be at least 10 seconds");

    setLoading(true);
    try {
      const problemRes = await api.post(`/problems/${roomId}/with-test-cases`, {
        title, description, difficulty, testCases, libraryProblemId: selectedLibraryId
      });
      await api.post(`/rooms/${roomId}/problem`, problemRes.data);
      await api.get(`/rooms/${roomId}`);
      await api.post(`/problems/rooms/${roomId}/start-problem`, { duration: timerDuration });
      const roomRes = await api.get(`/rooms/${roomId}`);
      setMyRoom(roomRes.data);
      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });
      setTitle(""); setDescription(""); setDifficulty("EASY"); setTestCases([{ input: "", output: "" }]); setSelectedLibraryId(null);
      setMessage("New round started!"); toastSuccess("New round started!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error during problem posting:", err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to post problem";
      setMessage(`${serverMsg}`); toastError(serverMsg);
    } finally { setLoading(false); }
  };

  const handleSelectProblem = (libProblem) => {
    setTitle(libProblem.title);
    setDescription(libProblem.description);
    setDifficulty(libProblem.difficulty || "MEDIUM");
    if (libProblem.testCases && libProblem.testCases.length > 0) {
      setTestCases(libProblem.testCases.map(tc => ({ input: tc.input || "", output: tc.output || "" })));
    } else { setTestCases([{ input: "", output: "" }]); }
    setActiveTab("problem");
    setSelectedLibraryId(libProblem.id);
    toastSuccess(`Selected: ${libProblem.title}`);
  };

  const handleSetMaxAnswers = async () => {
    if (!roomId || maxCorrectAnswers < 1) return;
    setLoading(true);
    try {
      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });
      setMessage("Max answers updated"); setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("Failed to update"); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!roomId || !adminId) return;
    if (!window.confirm("Delete room for everyone?")) return;
    setLoading(true);
    try {
      await api.delete(`/rooms/${roomId}`, { data: { playerId: adminId } });
      setMyRoom(null); onDelete?.();
    } catch { setMessage("Failed to delete room"); } finally { setLoading(false); }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode?.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const adminTabs = [
    { key: "problem", label: "Create Problem", icon: <FileText size={14} /> },
    { key: "library", label: "Library", icon: <Library size={14} /> },
    { key: "submit", label: "Solve", icon: <Code2 size={14} /> },
    { key: "settings", label: "Settings", icon: <Settings size={14} /> },
    { key: "leaderboard", label: "Leaderboard", icon: <Trophy size={14} /> },
    { key: "solutions", label: "Logs", icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] overflow-hidden flex flex-col h-full animate-in">
      {}
      {message && (
        <div className="bg-red-500/5 border-b border-red-500/10 px-5 py-2.5">
          <p className="text-xs text-red-400 font-medium">{message}</p>
        </div>
      )}

      {}
      <div className="bg-[#141118] border-b border-[#1e1215] px-5 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#e8e6e3]">Admin Workspace</h2>
          {isProblemActive && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#6b6560]" />
              <div className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-md ${timeLeft <= 30 ? "bg-red-500/10 text-red-400" : "bg-[#0f0d12] text-[#e8e6e3] border border-[#1e1215]"}`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex border-b border-[#1e1215] bg-[#0a0a0f] overflow-x-auto no-scrollbar">
        {adminTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-xs font-medium transition-all border-b-2 flex items-center justify-center gap-1.5 ${activeTab === tab.key
              ? "border-red-500 text-red-400 bg-red-500/5"
              : "border-transparent text-[#6b6560] hover:text-[#a8a29e] hover:bg-[#141118]"
              }`}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {activeTab === "problem" && (
          <div className="space-y-6 animate-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#a8a29e] mb-2">Problem Title</label>
                <input
                  className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
                  placeholder="Two Sum"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a8a29e] mb-2">Difficulty</label>
                <select
                  className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all appearance-none cursor-pointer"
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a8a29e] mb-2">Problem Description</label>
              <textarea
                className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
                placeholder="Describe the problem..."
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-[#a8a29e]">Test Cases</label>
                <span className="text-xs text-[#44403c]">{testCases.length} case(s)</span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {testCases.map((tc, i) => (
                  <div key={i} className="p-5 rounded-lg bg-[#141118] border border-[#1e1215] hover:border-[#2a1519] transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="text-xs text-[#6b6560] mb-1.5 block">Input {i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1215] rounded-lg text-[#e8e6e3] font-mono text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-[#44403c]"
                          placeholder="Input data"
                          rows={2}
                          value={tc.input}
                          onChange={e => updateTestCase(i, "input", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#6b6560] mb-1.5 block">Expected Output {i + 1}</label>
                        <textarea
                          className="w-full px-3 py-2.5 bg-[#0a0a0f] border border-[#1e1215] rounded-lg text-[#e8e6e3] font-mono text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-[#44403c]"
                          placeholder="Expected output"
                          rows={2}
                          value={tc.output}
                          onChange={e => updateTestCase(i, "output", e.target.value)}
                        />
                      </div>
                    </div>
                    {testCases.length > 1 && (
                      <button className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors" onClick={() => removeTestCase(i)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addTestCase}
                className="w-full py-3 mt-4 rounded-lg border border-dashed border-[#1e1215] text-[#6b6560] hover:text-[#a8a29e] hover:border-[#2a1519] text-sm font-medium transition-all"
              >
                + Add Test Case
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#a8a29e] mb-2">Timer Duration (seconds)</label>
                <input
                  type="number"
                  min={10}
                  className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                  value={timerDuration}
                  onChange={e => setTimerDuration(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#a8a29e] mb-2">Max Possible Solvers</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
                  value={maxCorrectAnswers}
                  onChange={e => setMaxCorrectAnswers(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              className="w-full py-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(220,38,38,0.3)] active:scale-[0.98] disabled:opacity-40"
              onClick={handlePost}
              disabled={loading}
            >
              {loading ? "Starting..." : "Start Problem"}
            </button>
          </div>
        )}

        {activeTab === "library" && (
          <div className="animate-in">
            <ProblemLibrary onSelectProblem={handleSelectProblem} />
          </div>
        )}

        {activeTab === "submit" && (
          <div className="animate-in h-full">
            {myRoom?.currentProblem ? (
              <Submit roomId={roomId} playerId={playerId} problemId={myRoom.currentProblem?.id} />
            ) : (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                <p className="text-sm text-[#44403c]">No problem active. Create one to start.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 animate-in max-w-2xl mx-auto">
            <div className="rounded-xl border border-[#1e1215] bg-[#141118] p-8">
              <h3 className="text-sm font-semibold text-[#e8e6e3] mb-6 flex items-center gap-2">
                <Settings size={16} className="text-red-400" /> Room Settings
              </h3>

              <div className="p-6 rounded-lg bg-[#0a0a0f] border border-[#1e1215] mb-6">
                <p className="text-xs text-[#6b6560] mb-3">Join Code</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-5 py-4 bg-[#141118] border border-[#1e1215] rounded-lg font-mono text-2xl font-bold text-[#e8e6e3] text-center">
                    {roomCode}
                  </div>
                  <button
                    onClick={copyRoomCode}
                    className={`px-5 py-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${copied
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "border border-[#1e1215] text-[#a8a29e] hover:border-red-500/30 hover:text-red-400"
                      }`}
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs text-[#6b6560] font-medium">Guidelines</p>
                <ul className="space-y-1.5 text-xs text-[#44403c]">
                  <li>• Share the join code with other players.</li>
                  <li>• Players can only join if they have the code.</li>
                  <li>• Admin can end the room at any time.</li>
                </ul>
              </div>
            </div>

            <button
              className="w-full py-3.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 size={14} /> Close Room
            </button>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-in space-y-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Players', v: players?.length || 0 },
                { l: 'Max Solvers', v: myRoom?.maxCorrectAnswers || 0 },
                { l: 'Solved', v: players?.filter(p => p?.hasAnsweredCorrectly)?.length || 0 }
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-lg bg-[#141118] border border-[#1e1215] text-center">
                  <p className="text-xs text-[#6b6560] mb-1">{s.l}</p>
                  <p className="text-xl font-bold text-[#e8e6e3]">{s.v}</p>
                </div>
              ))}
            </div>

            {players?.length > 0 ? (
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                  .map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#141118] border border-[#1e1215] hover:border-[#2a1519] transition-all">
                      <div className="text-xs font-bold text-[#44403c] w-6 text-center">{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#e8e6e3] truncate flex items-center gap-2">
                          {player.username}
                          {player.id === myRoom.admin?.id && <Crown size={12} className="text-red-400" />}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#e8e6e3]">{player.score ?? 0}</p>
                        <p className="text-[10px] text-[#44403c]">pts</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                <p className="text-sm text-[#44403c]">No data records.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "solutions" && (
          <div className="animate-in space-y-6 max-w-4xl mx-auto">
            {!isProblemActive ? (
              <div className="space-y-6">
                <div className="p-5 rounded-lg bg-[#141118] border-l-2 border-red-500">
                  <p className="text-sm font-medium text-[#e8e6e3]">
                    {topSubmissions?.length > 0 ? `${topSubmissions.length} submission(s)` : "No Submissions"}
                  </p>
                  {topSubmissions?.length > 0 && myRoom?.currentProblem && (
                    <p className="text-xs text-[#6b6560] mt-1">Problem: {myRoom.currentProblem.title}</p>
                  )}
                </div>

                {topSubmissions?.length > 0 ? (
                  <div className="space-y-4">
                    {topSubmissions.map((sub, idx) => (
                      <div key={sub.id} className="rounded-xl border border-[#1e1215] bg-[#141118] overflow-hidden group hover:border-[#2a1519] transition-all">
                        <div className={`p-5 border-b border-[#1e1215] ${sub.passed ? "bg-green-500/5" : "bg-red-500/5"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-xs font-bold text-[#44403c]">{idx + 1}</div>
                              <div>
                                <p className="text-sm font-medium text-[#e8e6e3]">{sub.player?.username || "Anonymous"}</p>
                                <p className="text-xs text-[#6b6560] mt-0.5">{sub.language?.toUpperCase() || "N/A"} • {new Date(sub.submittedAt).toLocaleTimeString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${sub.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                {sub.passed ? "Passed" : "Failed"}
                              </span>
                              <button
                                onClick={() => { setModalContent(sub); setCodeModalVisible(true); }}
                                className="p-2 rounded-lg bg-[#0a0a0f] border border-[#1e1215] text-[#a8a29e] hover:text-white hover:border-red-500/30 transition-all"
                                title="View Code"
                              >
                                <FileText size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 bg-[#0a0a0f]/50">
                          <pre className="text-[12px] text-[#6b6560] font-mono whitespace-pre-wrap truncate max-h-12 overflow-hidden">{sub.code}</pre>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                    <p className="text-sm text-[#44403c]">Scanning for incoming data...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
                <p className="text-sm text-[#44403c]">Solutions will be visible after the problem ends.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {}
      {codeModalVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-md p-4">
          <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in">
            <div className="flex items-center justify-between px-6 py-4 bg-[#141118] border-b border-[#1e1215]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center">
                  <Code2 size={16} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e8e6e3] leading-none">{modalContent?.player?.username || "Submission"}</h3>
                  <p className="text-[10px] text-[#6b6560] mt-1 uppercase tracking-wider">{modalContent?.language} • Solution</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(modalContent?.code || ""); toastSuccess("Copied to clipboard!"); }}
                  className="px-3 py-1.5 rounded-lg border border-[#1e1215] text-xs text-[#a8a29e] hover:text-[#e8e6e3] hover:border-red-500/30 transition-all flex items-center gap-1.5"
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  onClick={() => setCodeModalVisible(false)}
                  className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-0 bg-[#0a0a0f] custom-scrollbar">
              <pre className="text-sm font-mono text-[#a8a29e] leading-relaxed p-6 whitespace-pre">{modalContent?.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
