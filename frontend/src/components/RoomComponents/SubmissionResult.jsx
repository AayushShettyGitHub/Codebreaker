import React from "react";

export default function SubmissionResult({ result }) {
  if (!result) return null;

  const {
    problemId,
    score = 0,
    results = [],
    allPassed
  } = result;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-semibold">Problem</p>
          <p className="text-white font-bold text-lg">ID: {problemId ?? "N/A"}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400 font-semibold">Score</p>
          <p className={`text-4xl font-bold ${allPassed ? "text-emerald-400" : "text-yellow-400"}`}>
            {score}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <p className="text-white font-bold mt-5 mb-4">📋 Test Results</p>

        {results.length === 0 ? (
          <div className="text-sm text-slate-400 bg-slate-800/30 p-4 rounded-lg">
            No test case results returned.
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((r, idx) => (
              <li
                key={r.testCaseId}
                className={`p-4 border-2 rounded-lg transition-all ${
                  r.passed
                    ? "bg-emerald-500/10 border-emerald-500/50"
                    : "bg-red-500/10 border-red-500/50"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className={r.passed ? "text-emerald-400" : "text-red-400"}>
                        {r.passed ? "✓" : "✗"}
                      </span>
                      Test Case #{idx + 1}
                    </p>
                    {r.error && (
                      <pre className="text-xs text-red-400 font-mono mt-2 bg-slate-950/50 p-3 rounded border border-red-500/30 overflow-auto">
                        {r.error}
                      </pre>
                    )}
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${r.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    {r.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-xs text-slate-400 font-semibold mb-2">Overall Result</p>
        <div className="flex items-center justify-between">
          <span className="text-white font-bold">Final Status:</span>
          <span className={`text-lg font-bold ${allPassed ? "text-emerald-400" : "text-yellow-400"}`}>
            {allPassed ? "✓ All Passed" : "⚠ Some Failed"}
          </span>
        </div>
      </div>
    </div>
  );
}
