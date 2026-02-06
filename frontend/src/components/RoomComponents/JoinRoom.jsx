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
      console.log("✅ Successfully joined room:", roomData);
      onJoin(roomData);
      
      if (roomData?.id) {
        console.log("📥 Fetching players for room:", roomData.id);
        setTimeout(() => {
          fetchPlayers(roomData.id);
          console.log("✅ Players fetch triggered for room:", roomData.id);
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
    <form onSubmit={handleJoin} className="bg-white border border-gray-300 shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Join Competition</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter the room code to join an existing competition.
      </p>

      <div className="flex gap-2">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-sm"
        >
          {loading ? "Joining..." : "Join"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mt-3 font-medium">{error}</p>}
    </form>
  );
}
