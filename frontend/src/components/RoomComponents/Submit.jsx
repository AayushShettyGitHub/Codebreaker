import { useState, useEffect } from "react";
import api from "../../config/client";
import SubmissionResult from "./SubmissionResult";

export default function Submit({ roomId, playerId, problemId }) {
  const [code, setCode] = useState("# write your solution here\n");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Optional: log props on mount or change for debugging
  useEffect(() => {
    console.log("Submit component props:", { roomId, playerId, problemId });
  }, [roomId, playerId, problemId]);

  async function handleSubmit() {
    console.log("Submitting solution", { problemId, playerId, roomId, code, language });

    if (!playerId || !roomId || !problemId) {
      alert("Missing player, room or problem ID");
      console.warn("Missing IDs:", { problemId, playerId, roomId });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/submissions`, {
        problemId: Number(problemId),
        playerId: Number(playerId),
        roomId: Number(roomId),
        code,
        language
      });

      console.log("Submission result:", res.data);
      setResult(res.data);
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.error || err.message || "Error submitting code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Code Submission</h3>

      <div className="mt-3">
        <label className="text-sm">Language</label>
        <select
          className="ml-2 p-1 border rounded"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <textarea
        className="w-full mt-3 p-2 border rounded font-mono text-sm"
        rows={12}
        value={code}
        onChange={e => setCode(e.target.value)}
      />

      <div className="mt-3 flex gap-2">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading || !playerId || !roomId || !problemId}
        >
          {loading ? "Running..." : "Run & Submit"}
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setCode("# write your solution here\n")}
        >
          Reset
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <SubmissionResult result={result} />
        </div>
      )}
    </div>
  );
}
