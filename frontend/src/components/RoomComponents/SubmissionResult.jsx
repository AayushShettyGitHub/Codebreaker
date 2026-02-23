import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

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
    <div className="space-y-5 animate-in">
      {}
      <div className="flex items-center justify-between p-5 rounded-lg bg-[#141118] border border-[#1e1215]">
        <div>
          <p className="text-xs text-[#6b6560] mb-0.5">Problem</p>
          <p className="text-sm font-semibold text-[#e8e6e3]">ID: {problemId ?? "Unknown"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#6b6560] mb-0.5">Score</p>
          <p className={`text-2xl font-bold ${allPassed ? "text-green-400" : "text-[#a8a29e]"}`}>
            {score}
          </p>
        </div>
      </div>

      {}
      <div>
        <p className="text-xs font-medium text-[#6b6560] mb-3">Test Results</p>

        {results.length === 0 ? (
          <div className="text-center py-10 rounded-lg border border-dashed border-[#1e1215] bg-[#141118]">
            <p className="text-xs text-[#44403c]">No test data available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleResults.map((r, idx) => (
              <div
                key={r.testCaseId}
                className={`p-5 rounded-lg border transition-all ${r.passed
                  ? "bg-[#141118] border-[#1e1215]"
                  : "bg-red-500/5 border-red-500/15"
                  }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    {r.passed ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <XCircle size={14} className="text-red-400 animate-pulse" />
                    )}
                    <p className="text-sm font-medium text-[#e8e6e3]">
                      Test Case {idx + 1}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${r.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                    {r.passed ? "Passed" : "Failed"}
                  </span>
                </div>

                <div className="grid gap-3">
                  {r.input && (
                    <div>
                      <p className="text-xs text-[#6b6560] mb-1.5">Input</p>
                      <pre className="text-xs text-[#a8a29e] font-mono bg-[#0a0a0f] p-3 rounded-lg border border-[#1e1215] overflow-auto max-h-28 custom-scrollbar">
                        {r.input}
                      </pre>
                    </div>
                  )}

                  {r.expectedOutput && (
                    <div>
                      <p className="text-xs text-[#6b6560] mb-1.5">Expected Output</p>
                      <pre className="text-xs text-[#a8a29e] font-mono bg-[#0a0a0f] p-3 rounded-lg border border-[#1e1215] overflow-auto max-h-28 custom-scrollbar">
                        {r.expectedOutput}
                      </pre>
                    </div>
                  )}

                  {r.actualOutput && (
                    <div>
                      <p className="text-xs text-[#6b6560] mb-1.5">Your Output</p>
                      <pre className={`text-xs font-mono p-3 rounded-lg border overflow-auto max-h-28 custom-scrollbar ${r.passed
                        ? "bg-[#0a0a0f] text-[#a8a29e] border-[#1e1215]"
                        : "bg-[#0a0a0f] text-red-400 border-red-500/10"
                        }`}>
                        {r.actualOutput}
                      </pre>
                    </div>
                  )}

                  {r.error && (
                    <div>
                      <p className="text-xs text-red-400 mb-1.5">Error</p>
                      <pre className="text-xs text-red-400 font-mono bg-[#0a0a0f] p-3 rounded-lg border border-red-500/10 overflow-auto max-h-28 custom-scrollbar">
                        {r.error}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {remaining > 0 && (
              <p className="text-xs text-[#44403c] text-center pt-2">
                {remaining} more test case(s) hidden
              </p>
            )}
          </div>
        )}
      </div>

      {}
      <div className={`p-4 rounded-lg flex items-center justify-between ${allPassed ? "bg-green-500/5 border border-green-500/15" : "bg-red-500/5 border border-red-500/15"}`}>
        <div className="flex items-center gap-2.5">
          {allPassed ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400 animate-pulse" />}
          <span className="text-xs font-medium text-[#a8a29e]">Overall Status</span>
        </div>
        <span className={`text-sm font-semibold ${allPassed ? "text-green-400" : "text-red-400"}`}>
          {allPassed ? "All Passed" : "Some Failed"}
        </span>
      </div>
    </div>
  );
}
