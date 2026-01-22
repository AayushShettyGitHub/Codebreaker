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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700 rounded-2xl p-6 space-y-5">
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
          <div className="text-sm text-slate-400 bg-slate-800/40 p-4 rounded-lg border border-slate-700">
            No test case results returned.
          </div>
        ) : (
          <ul className="space-y-4">
            {results.map((r, idx) => (
              <li
                key={r.testCaseId}
                className={`p-4 border-2 rounded-lg transition-all ${
                  r.passed
                    ? "bg-emerald-600/20 border-emerald-600/50"
                    : "bg-red-600/20 border-red-600/50"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-white flex items-center gap-2">
                      <span className={r.passed ? "text-emerald-300" : "text-red-300"}>
                        {r.passed ? "✓" : "✗"}
                      </span>
                      Test Case #{idx + 1}
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${r.passed ? "bg-emerald-600/30 text-emerald-300" : "bg-red-600/30 text-red-300"}`}>
                    {r.passed ? "PASS" : "FAIL"}
                  </span>
                </div>

                {r.input && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-300 mb-2">📥 Input:</p>
                    <pre className="text-xs text-slate-300 font-mono bg-slate-900/50 p-3 rounded border border-slate-700 overflow-auto max-h-32">
                      {r.input}
                    </pre>
                  </div>
                )}

                {r.expectedOutput && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-emerald-300 mb-2">✓ Expected Output:</p>
                    <pre className="text-xs text-emerald-300 font-mono bg-emerald-950/20 p-3 rounded border border-emerald-600/40 overflow-auto max-h-32">
                      {r.expectedOutput}
                    </pre>
                  </div>
                )}

                {r.actualOutput && (
                  <div className="mb-3">
                    <p className={`text-xs font-semibold mb-2 ${r.passed ? "text-blue-300" : "text-red-300"}`}>
                      {r.passed ? "✓ Actual Output:" : "✗ Actual Output:"}
                    </p>
                    <pre className={`text-xs font-mono p-3 rounded border overflow-auto max-h-32 ${
                      r.passed
                        ? "bg-blue-950/20 text-blue-300 border-blue-600/40"
                        : "bg-red-950/20 text-red-300 border-red-600/40"
                    }`}>
                      {r.actualOutput}
                    </pre>
                  </div>
                )}

                {r.error && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-red-300 mb-2">❌ Error:</p>
                    <pre className="text-xs text-red-400 font-mono bg-red-950/30 p-3 rounded border border-red-500/30 overflow-auto max-h-32">
                      {r.error}
                    </pre>
                  </div>
                )}
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
