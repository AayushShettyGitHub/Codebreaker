import React from "react";

export default function SubmissionResult({ result }) {
  if (!result) return null;

  const {
    problemId,
    score = 0,
    results = [],
    allPassed
  } = result;

  const visibleResults = results.slice(0, 2);
  const remaining = Math.max(0, results.length - visibleResults.length);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 font-semibold">Problem</p>
          <p className="text-black font-bold text-lg">ID: {problemId ?? "N/A"}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-600 font-semibold">Score</p>
          <p className={`text-4xl font-bold ${allPassed ? "text-emerald-600" : "text-yellow-600"}`}>
            {score}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <p className="text-black font-bold mt-5 mb-4">Test Results</p>

        {results.length === 0 ? (
          <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded-lg border border-gray-200">
            No test case results returned.
          </div>
        ) : (
          <ul className="space-y-4">
            {visibleResults.map((r, idx) => (
              <li
                key={r.testCaseId}
                className={`p-4 border-2 rounded-lg transition-all ${
                  r.passed
                    ? "bg-emerald-100 border-emerald-200"
                    : "bg-red-100 border-red-200"
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <p className="font-bold text-black flex items-center gap-2">
                      <span className={r.passed ? "text-emerald-600" : "text-red-600"}>
                        {r.passed ? "✓" : "✗"}
                      </span>
                      Test Case #{idx + 1}
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${r.passed ? "bg-emerald-200 text-emerald-700" : "bg-red-200 text-red-700"}`}>
                    {r.passed ? "PASS" : "FAIL"}
                  </span>
                </div>

                {r.input && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-800 mb-2">📥 Input:</p>
                    <pre className="text-xs text-black font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-32">
                      {r.input}
                    </pre>
                  </div>
                )}

                {r.expectedOutput && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-800 mb-2">✓ Expected Output:</p>
                    <pre className="text-xs text-black font-mono bg-white p-3 rounded border border-gray-200 overflow-auto max-h-32">
                      {r.expectedOutput}
                    </pre>
                  </div>
                )}

                {r.actualOutput && (
                  <div className="mb-3">
                    <p className={`text-xs font-semibold mb-2 ${r.passed ? "text-gray-800" : "text-gray-800"}`}>
                      {r.passed ? "✓ Actual Output:" : "✗ Actual Output:"}
                    </p>
                    <pre className={`text-xs font-mono p-3 rounded border overflow-auto max-h-32 ${
                      r.passed
                        ? "bg-white text-black border-emerald-200"
                        : "bg-white text-black border-red-200"
                    }`}>
                      {r.actualOutput}
                    </pre>
                  </div>
                )}

                {r.error && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-800 mb-2">Error:</p>
                    <pre className="text-xs text-black font-mono bg-white p-3 rounded border border-red-100 overflow-auto max-h-32">
                      {r.error}
                    </pre>
                  </div>
                )}
              </li>
            ))}

            {remaining > 0 && (
              <li className="text-sm text-gray-600">+{remaining} more test case(s) hidden</li>
            )}
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
