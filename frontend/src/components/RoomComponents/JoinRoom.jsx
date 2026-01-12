import { useState } from "react";
import api from "../../config/client";

export default function JoinRoom({ playerId, onJoin }) {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin(e) {
    e.preventDefault();
    if (!playerId) return;

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/rooms/join", {
        playerId,
        joinCode
      });

      onJoin(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        "Invalid join code or error joining room."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleJoin} className="bg-slate-900 border border-slate-700 shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Join Competition</h3>
      <p className="text-sm text-slate-400 mb-4">
        Enter the room code to join an existing competition.
      </p>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          type="text"
          placeholder="Enter Room Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-sm"
        >
          {loading ? "Joining..." : "Join"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
    </form>
  );
}
