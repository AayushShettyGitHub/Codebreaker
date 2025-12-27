import { useState } from "react";
import api from "../../config/client";

export default function CreateRoom({ playerId, onCreate }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleCreate() {
    if (!playerId) {
      alert("Player not logged in");
      return;
    }

    if (!name.trim()) {
      alert("Room name cannot be empty");
      return;
    }

    try {
      const res = await api.post("/rooms", {
        name,
        privateRoom: isPrivate,
        playerId: playerId
      });
      onCreate(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating room");
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-semibold">Create a Room</h3>
      <p className="text-sm text-gray-500 mt-1">Create a room and invite others to join using the room code.</p>

      <div className="mt-3 space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            className="w-4 h-4"
          />
          Private room
        </label>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={handleCreate}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
