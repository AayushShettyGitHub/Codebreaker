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
        console.log("Submission received:", message.playerUsername);
      } else if (message.type === "SUBMISSION_RESULT") {
        if (message.result?.allPassed) {
          console.log(`${message.playerUsername} solved the problem`);
        }
      } else if (message.type === "SCORE_UPDATE") {
        if (message.correct && message.playerId !== playerId) {
          console.log(`${message.playerUsername} scored ${message.score}`);
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
        setError("Maximum submissions reached. No more solutions can be accepted.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  const isDisabled =
    loading || !playerId || !roomId || !problemId || maxSubmissionsReached;

  return (
    <div className="bg-gradient-to-br from-slate-500/30 to-slate-600/30 backdrop-blur-md border border-slate-500/40 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <span className="text-xl md:text-2xl">💻</span>
        <h3 className="text-lg md:text-xl font-bold text-slate-900">
          Code Submission
        </h3>
      </div>

      {!problemId && (
        <div className="mb-4 p-3 md:p-4 bg-yellow-100 border border-yellow-200 rounded-lg md:rounded-xl">
          <p className="text-slate-900 text-xs md:text-sm font-medium">
            No active problem yet
          </p>
        </div>
      )}

      {maxSubmissionsReached && (
        <div className="mb-4 p-3 md:p-4 bg-orange-500/20 border border-orange-500/40 rounded-lg md:rounded-xl">
          <p className="text-orange-200 text-xs md:text-sm font-medium">
            Maximum submissions reached. No more solutions can be accepted.
          </p>
        </div>
      )}

      {error && !maxSubmissionsReached && (
        <div className="mb-4 p-3 md:p-4 bg-red-500/20 border border-red-500/40 rounded-lg md:rounded-xl">
          <p className="text-red-200 text-xs md:text-sm font-medium">
            {error}
          </p>
        </div>
      )}

      <div className="mb-4 md:mb-5">
        <label className="block text-xs md:text-sm font-semibold text-slate-900 mb-2 md:mb-3">
          Programming Language
        </label>
        <select
          className="w-full px-3 md:px-4 py-2 md:py-3 bg-white border border-slate-300 rounded-lg md:rounded-xl text-slate-900 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isDisabled}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="mb-4 md:mb-5 flex-1 flex flex-col min-h-64 md:min-h-96">
        <label className="block text-xs md:text-sm font-semibold text-slate-900 mb-2 md:mb-3">
          Your Code
        </label>
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
          className={`flex-1 px-4 py-3 md:py-4 text-slate-100 font-bold rounded-lg md:rounded-xl transition-all shadow-md text-sm md:text-base ${
            isDisabled
              ? "bg-slate-500 opacity-50 cursor-not-allowed"
              : "bg-gradient-to-r from-slate-500 to-slate-400 hover:from-slate-600 hover:to-slate-500"
          }`}
          onClick={handleSubmit}
          disabled={isDisabled}
        >
          {loading ? "Running..." : "Run & Submit"}
        </button>

        <button
          className="flex-1 px-4 py-3 md:py-4 bg-slate-600/30 hover:bg-slate-600/40 disabled:opacity-50 text-slate-100 font-bold rounded-lg md:rounded-xl transition-all text-sm md:text-base border border-slate-600/40"
          onClick={() => setCode("# write your solution here\n")}
          disabled={isDisabled}
        >
          Reset
        </button>
      </div>

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-500/40">
          {result.correctAnswerCount > result.maxCorrectAnswers && (
            <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/40 rounded-lg">
              <p className="text-orange-200 text-xs font-medium">
                Submissions exceeded: {result.correctAnswerCount} /{" "}
                {result.maxCorrectAnswers}
              </p>
            </div>
          )}
          <SubmissionResult result={result} />
        </div>
      )}
    </div>
  );
}
