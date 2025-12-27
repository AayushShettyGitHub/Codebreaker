import React from "react";

export default function SubmissionResult({ result }) {
  return (
    <div className="bg-gray-50 border rounded p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Problem</div>
          <div className="font-medium">ID: {result.problemId}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Score</div>
          <div className="font-semibold">{result.score}</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="font-medium">Results</div>
        <ul className="mt-2 space-y-2">
          {result.results?.map((r) => (
            <li key={r.testCaseId} className="p-2 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">TestCase {r.testCaseId}</div>
                {r.error && <div className="text-sm text-red-600">{r.error}</div>}
              </div>
              <div className={r.passed ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {r.passed ? "PASS" : "FAIL"}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 text-sm text-gray-600">Overall: {result.allPassed ? "All Passed" : "Some Failed"}</div>
    </div>
  );
}
