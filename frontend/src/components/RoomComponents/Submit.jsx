import { useState, useEffect } from "react";
import api from "../../config/client";
import websocketService from "../../services/websocketService";
import SubmissionResult from "./SubmissionResult";
import CodeEditor from "./CodeEditor";
import { useRoom } from "../../context/RoomContext";

export default function Submit({ playerId }) {
  const { myRoom } = useRoom();

  const roomId = myRoom?.id;
  const problemId = myRoom?.currentProblem?.id;

  const [code, setCode] = useState("# write your solution here\n");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxSubmissionsReached, setMaxSubmissionsReached] = useState(false);

  useEffect(() => {
    setCode("# write your solution here\n");
    setResult(null);
    setError("");
    setMaxSubmissionsReached(false);
  }, [problemId]);

  useEffect(() => {
    if (!roomId || !websocketService.isReady()) return;

    const handleSubmissionFeedback = (message) => {
      if (message.type === "SUBMISSION_RECEIVED") {
        console.log("Submission received notification:", message.playerUsername);
      } else if (message.type === "SUBMISSION_RESULT") {
        console.log("Submission result from other player:", message.result);
        if (message.result?.allPassed) {
          console.log(`${message.playerUsername} solved the problem!`);
        }
      } else if (message.type === "SCORE_UPDATE") {
        if (message.correct && message.playerId !== playerId) {
          console.log(`${message.playerUsername} scored ${message.score} points!`);
        }
      }
    };

    websocketService.subscribe(`/topic/room/${roomId}`, handleSubmissionFeedback);

    return () => {
      websocketService.unsubscribe(`/topic/room/${roomId}`);
    };
  }, [roomId, playerId]);

  async function handleSubmit() {
    if (!playerId || !roomId || !problemId) {
      setError("Missing player, room, or problem");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await api.post("/submissions", {
        problemId,
        playerId,
        roomId,
        code,
        language
      });

      setResult(res.data);
      
      if (res.data.correctAnswerCount > res.data.maxCorrectAnswers) {
        setMaxSubmissionsReached(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Submission failed";
      
      if (errorMessage.includes("Maximum correct answers")) {
        setMaxSubmissionsReached(true);
        setError("✋ Maximum submissions reached! No more solutions can be accepted.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || !playerId || !roomId || !problemId || maxSubmissionsReached;

  return (
    <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-lg border border-slate-700 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <span className="text-xl md:text-2xl">💻</span>
        <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">Code Submission</h3>
      </div>

      {!problemId && (
        <div className="mb-4 p-3 md:p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-lg md:rounded-xl">
          <p className="text-yellow-300 text-xs md:text-sm font-medium">⏳ No active problem yet</p>
        </div>
      )}

      {maxSubmissionsReached && (
        <div className="mb-4 p-3 md:p-4 bg-orange-600/20 border border-orange-600/40 rounded-lg md:rounded-xl animate-pulse">
          <p className="text-orange-300 text-xs md:text-sm font-medium">✋ Maximum submissions reached! No more solutions can be accepted.</p>
        </div>
      )}

      {error && !maxSubmissionsReached && (
        <div className="mb-4 p-3 md:p-4 bg-red-600/20 border border-red-600/40 rounded-lg md:rounded-xl animate-pulse">
          <p className="text-red-300 text-xs md:text-sm font-medium">❌ {error}</p>
        </div>
      )}

      <div className="mb-4 md:mb-5">
        <label className="block text-xs md:text-sm font-semibold text-slate-300 mb-2 md:mb-3">Programming Language</label>
        <select
          className="w-full px-3 md:px-4 py-2 md:py-3 bg-slate-800/70 border border-slate-700 rounded-lg md:rounded-xl text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          disabled={isDisabled}
        >
          <option value="python">🐍 Python</option>
          <option value="javascript">📜 JavaScript</option>
          <option value="java">☕ Java</option>
          <option value="cpp">⚙️ C++</option>
        </select>
      </div>

      <div className="mb-4 md:mb-5 flex-1 flex flex-col min-h-64 md:min-h-96">
        <label className="block text-xs md:text-sm font-semibold text-slate-300 mb-2 md:mb-3">Your Code</label>
        <div className="flex-1 overflow-hidden rounded-lg">
          <CodeEditor 
            value={code} 
            onChange={setCode} 
            language={language}
            disabled={isDisabled}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4">
        <button
          className={`flex-1 px-4 py-3 md:py-4 text-white font-bold rounded-lg md:rounded-xl transition-all shadow-lg transform text-sm md:text-base whitespace-nowrap ${
            isDisabled
              ? "bg-slate-600 opacity-50 cursor-not-allowed"
              : "bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 hover:shadow-slate-500/50 hover:scale-105"
          }`}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading ? "⏳ Running..." : "🚀 Run & Submit"}
        </button>

        <button
          className="flex-1 px-4 py-3 md:py-4 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-lg md:rounded-xl transition-all text-sm md:text-base border border-slate-700 whitespace-nowrap"
          onClick={() => setCode("# write your solution here\n")}
          disabled={isDisabled}
        >
          🔄 Reset
        </button>
      </div>

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          {result.correctAnswerCount > result.maxCorrectAnswers && (
            <div className="mb-4 p-3 bg-orange-600/20 border border-orange-600/40 rounded-lg">
              <p className="text-orange-300 text-xs font-medium">
                ⚠️ Submissions exceeded: {result.correctAnswerCount} / {result.maxCorrectAnswers}
              </p>
            </div>
          )}
          <SubmissionResult result={result} />
        </div>
      )}
    </div>
  );
}
