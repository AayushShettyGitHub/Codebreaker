import { useState, useEffect } from "react";
import api from "../../config/client";
import SubmissionResult from "./SubmissionResult";
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

  useEffect(() => {
    setCode("# write your solution here\n");
    setResult(null);
    setError("");
  }, [problemId]);

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
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = loading || !playerId || !roomId || !problemId;

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">💻</span>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Code Submission</h3>
      </div>

      {!problemId && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-yellow-400 text-sm font-medium">⏳ No active problem yet</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
          <p className="text-red-400 text-sm font-medium">❌ {error}</p>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-300 mb-3">Programming Language</label>
        <select
          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

      <div className="mb-5 flex-1 flex flex-col min-h-96">
        <label className="block text-sm font-semibold text-slate-300 mb-3">Your Code</label>
        <textarea
          className="flex-1 p-4 bg-slate-950/50 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="# write your solution here"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={isDisabled}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 text-sm"
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading ? "⏳ Running..." : "🚀 Run & Submit"}
        </button>

        <button
          className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl transition-all text-sm border border-slate-700"
          onClick={() => setCode("# write your solution here\n")}
          disabled={isDisabled}
        >
          🔄 Reset
        </button>
      </div>

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <SubmissionResult result={result} />
        </div>
      )}
    </div>
  );
}
