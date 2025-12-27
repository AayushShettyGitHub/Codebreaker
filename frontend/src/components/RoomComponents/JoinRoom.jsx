import { useState } from "react";
import api from "../../config/client";

export default function JoinRoom({ playerId, onJoin }) {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  async function handleJoin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
  "/rooms/join",
  { playerId, joinCode },
  { withCredentials: true } 
);
  onJoin(res.data);
    } catch (err) {
      console.error(err);
      setError("Invalid join code or error joining room.");
    }
  }

  return (
    <form onSubmit={handleJoin} className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold">Join a Room</h3>
      <p className="text-sm text-gray-500 mt-1">Enter the room code you received to join an existing room.</p>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          placeholder="Enter Room Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          required
        />
        <button className="px-4 py-2 bg-green-600 text-white rounded-md">Join</button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  );
}
