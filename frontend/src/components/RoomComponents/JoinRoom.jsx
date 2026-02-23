import { useState } from "react";
import { useRoom } from "../../context/RoomContext";
import api from "../../config/client";

export default function JoinRoom({ playerId, onJoin }) {
  const { fetchPlayers } = useRoom();
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

      const roomData = res.data;
      console.log("Successfully joined room:", roomData);
      onJoin(roomData);

      if (roomData?.id) {
        console.log("📥 Fetching players for room:", roomData.id);
        setTimeout(() => {
          fetchPlayers(roomData.id);
          console.log("Players fetch triggered for room:", roomData.id);
        }, 100);
      }
    } catch (err) {
      console.error(err);
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        setError(getErrorMessage(err));
      } catch (e) {
        setError("Invalid join code or error joining room.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleJoin} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#e8e6e3] mb-1">Join Room</h3>
        <p className="text-sm text-[#6b6560]">
          Enter the join code to join an existing room.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#a8a29e] mb-2">Join Code</label>
          <input
            className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm font-mono tracking-wider focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
            type="text"
            placeholder="ABC-123"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(220,38,38,0.3)] active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </form>
  );
}
