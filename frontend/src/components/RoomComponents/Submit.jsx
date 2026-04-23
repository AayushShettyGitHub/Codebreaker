import { useState, useEffect } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import SubmissionResult from "./SubmissionResult";
import CodeEditor from "./CodeEditor";
import { useRoom } from "../../context/RoomContext";
import { Play, RotateCcw, AlertCircle, Lock, Loader2 } from "lucide-react";

export default function Submit({ playerId, roomId: propsRoomId, problemId: propsProblemId }) {
  const { myRoom } = useRoom();

  const roomId = propsRoomId || myRoom?.id;
  const problemId = propsProblemId || myRoom?.currentProblem?.id;

  const [code, setCode] = useState(() => {
    if (propsRoomId && propsProblemId) {
      const saved = localStorage.getItem(`code:${propsRoomId}:${propsProblemId}`);
      if (saved !== null) return saved;
    }
    return "# write your solution here\n";
  });
  const [language, setLanguage] = useState(() => {
    if (propsRoomId && propsProblemId) {
      const saved = localStorage.getItem(`lang:${propsRoomId}:${propsProblemId}`);
      if (saved !== null) return saved;
    }
    return "python";
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxSubmissionsReached, setMaxSubmissionsReached] = useState(false);


  useEffect(() => {
    setResult(null);
    setError("");
    setMaxSubmissionsReached(false);

    if (roomId && problemId) {
      const codeKey = `code:${roomId}:${problemId}`;
      const langKey = `lang:${roomId}:${problemId}`;

      const savedCode = localStorage.getItem(codeKey);
      const savedLang = localStorage.getItem(langKey);

      if (savedCode !== null) setCode(savedCode);
      else setCode("# write your solution here\n");

      if (savedLang !== null) setLanguage(savedLang);
    }
  }, [roomId, problemId]);

  useEffect(() => {
    if (problemId && roomId) {
      localStorage.setItem(`code:${roomId}:${problemId}`, code);
    }
  }, [code, roomId, problemId]);


  useEffect(() => {
    if (problemId && roomId) {
      localStorage.setItem(`lang:${roomId}:${problemId}`, language);
    }
  }, [language, roomId, problemId]);

  useEffect(() => {
    if (!roomId || !websocketService.isReady()) return;
    const handleSubmissionFeedback = (message) => {
      if (message.type === "SUBMISSION_RECEIVED") {
        console.log("Submission received:", message.playerUsername);
      } else if (message.type === "SUBMISSION_RESULT") {
        if (message.result?.allPassed) console.log(`${message.playerUsername} solved the problem`);
      } else if (message.type === "SCORE_UPDATE") {
        if (message.correct && message.playerId !== playerId) console.log(`${message.playerUsername} scored ${message.score}`);
      }
    };
    websocketService.subscribe(`/topic/room/${roomId}`, handleSubmissionFeedback);
    return () => websocketService.unsubscribe(`/topic/room/${roomId}`);
  }, [roomId, playerId]);

  async function handleSubmit() {
    if (!playerId || !roomId || !problemId) { setError("Missing player, room, or problem"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const res = await api.post("/submissions", { problemId, playerId, roomId, code, language });
      setResult(res.data);
      if (res.data.correctAnswerCount > res.data.maxCorrectAnswers) setMaxSubmissionsReached(true);
    } catch (err) {
      console.error("Submission error:", err);
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        const errorMessage = getErrorMessage(err);
        if (errorMessage.includes("Maximum correct answers")) {
          setMaxSubmissionsReached(true);
          setError("Maximum submissions reached. No more solutions can be accepted.");
        } else {
          const displayError = err.response?.data?.message || err.response?.data?.error || errorMessage || "An unexpected error occurred";
          setError(displayError);
        }
      } catch (e) { setError(`Submission failed: ${err.message || 'Unknown error'}`); }
    } finally { setLoading(false); }
  }

  const isDisabled = loading || !playerId || !roomId || !problemId || maxSubmissionsReached;

  return (
    <div className="rounded-xl border border-[#1c1c22] bg-[#0f0f13] p-6 md:p-8 flex flex-col h-full animate-in relative overflow-hidden">
      { }
      <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#1c1c22]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 rounded-full bg-indigo-500"></div>
          <div>
            <h3 className="text-sm font-semibold text-[#e4e4e7]">Code Editor</h3>
            <p className="text-xs text-[#71717a] mt-0.5">Write and submit your solution</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!problemId ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141419] border border-[#1c1c22]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3f3f46]"></span>
              <span className="text-xs text-[#3f3f46] font-medium">Offline</span>
            </div>
          ) : maxSubmissionsReached ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
              <Lock size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Locked</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-400 font-medium">Ready</span>
            </div>
          )}
        </div>
      </div>

      { }
      {maxSubmissionsReached && (
        <div className="mb-5 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-400 font-medium">Max submissions reached. This editor is now locked.</p>
        </div>
      )}

      {error && !maxSubmissionsReached && (
        <div className="mb-5 p-4 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      { }
      <div className="mb-5">
        <label className="block text-xs font-medium text-[#a1a1aa] mb-2">Language</label>
        <select
          className="w-full max-w-xs px-4 py-2.5 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isDisabled}
        >
          <option value="python">Python 3</option>
          <option value="javascript">Node.js</option>
          <option value="java">Java 17</option>
          <option value="cpp">C++ 20</option>
        </select>
      </div>

      { }
      <div className="flex-1 flex flex-col min-h-[500px]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[#71717a]">Solution Code</label>
          <span className="text-xs text-[#3f3f46]">{code.split('\n').length} lines</span>
        </div>
        <div className="flex-1 rounded-lg overflow-hidden border border-[#1c1c22]">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            disabled={isDisabled}
          />
        </div>
      </div>

      { }
      <div className="flex gap-3 mt-6">
        <button
          className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isDisabled
            ? "bg-[#141419] text-[#3f3f46] border border-[#1c1c22] cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
            }`}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Play size={16} /> Submit Solution</>}
        </button>

        <button
          className="px-6 py-3 rounded-lg border border-[#1c1c22] text-[#71717a] hover:text-[#a1a1aa] hover:border-[#27272a] text-sm font-medium transition-all flex items-center gap-2"
          onClick={() => {
            if (window.confirm("Reset your code?")) {
              setCode("# write your solution here\n");
              const key = `code:${roomId}:${problemId}`;
              localStorage.removeItem(key);
            }
          }}
          disabled={isDisabled}
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      { }
      {result && (
        <div className="mt-8 pt-8 border-t border-[#1c1c22] animate-in">
          <div className="flex items-center gap-3 mb-6">
            <h4 className="text-xs font-medium text-[#71717a]">Submission Results</h4>
            <div className="flex-1 h-px bg-[#1c1c22]"></div>
          </div>
          <SubmissionResult result={result} />
        </div>
      )}
    </div>
  );
}
