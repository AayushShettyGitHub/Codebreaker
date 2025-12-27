import { useState } from "react";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";

export default function AdminRoom({ adminId, onDelete }) {
  const { myRoom } = useRoom();
  const roomId = myRoom?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
  const [maxCorrectAnswers, setMaxCorrectAnswers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function addTestCase() {
    setTestCases([...testCases, { input: "", output: "" }]);
  }

  function removeTestCase(index) {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  }

  function updateTestCase(index, field, value) {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  }

  async function handlePost() {
    if (!roomId) {
      setMessage("Room ID is missing.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setMessage("Title and description are required.");
      return;
    }
    if (testCases.some(tc => !tc.input.trim() || !tc.output.trim())) {
      setMessage("All test cases must have input and output.");
      return;
    }

    setLoading(true);
    try {
      const problemRes = await api.post(`/problems/${roomId}/with-test-cases`, {
        title,
        description,
        difficulty,
        testCases
      });

      setMessage("Problem with test cases posted successfully!");
      setTitle("");
      setDescription("");
      setDifficulty("EASY");
      setTestCases([{ input: "", output: "" }]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error posting problem.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetMaxAnswers() {
    if (!roomId || maxCorrectAnswers < 1) {
      setMessage("Invalid max correct answers value.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/rooms/${roomId}/maxCorrectAnswers`, { maxCorrectAnswers });
      setMessage(`Max correct answers set to ${maxCorrectAnswers}.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Error setting max correct answers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!roomId || !adminId) return;
    if (!confirm("Delete this room for everyone? This cannot be undone.")) return;
    setLoading(true);
    try {
      await api.delete(`/rooms/${roomId}`, { data: { playerId: adminId } });
      setMessage("Room deleted.");
      if (typeof onDelete === "function") onDelete();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.error || "Error deleting room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 space-y-6">
      {message && (
        <div className={`p-3 rounded ${message.includes("Error") || message.includes("Invalid") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          {message}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold mb-4">Post Problem with Test Cases</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Problem title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Problem description"
              rows="3"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Difficulty Level</label>
            <select
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Test Cases</label>
              <button
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                onClick={addTestCase}
              >
                + Add Test Case
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded">
              {testCases.map((testCase, index) => (
                <div key={index} className="bg-white p-3 rounded border space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Test Case {index + 1}</span>
                    {testCases.length > 1 && (
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        onClick={() => removeTestCase(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="Input"
                    rows="2"
                    value={testCase.input}
                    onChange={e => updateTestCase(index, "input", e.target.value)}
                  />
                  <textarea
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="Expected Output"
                    rows="2"
                    value={testCase.output}
                    onChange={e => updateTestCase(index, "output", e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              onClick={handlePost}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Problem"}
            </button>

            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 ml-auto"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Room
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-semibold mb-3">Configure Problem Settings</h3>
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
          <label className="text-sm font-medium">Max Correct Answers:</label>
          <input
            className="w-20 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            type="number"
            min="1"
            value={maxCorrectAnswers}
            onChange={e => setMaxCorrectAnswers(parseInt(e.target.value) || 1)}
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            onClick={handleSetMaxAnswers}
            disabled={loading}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}
