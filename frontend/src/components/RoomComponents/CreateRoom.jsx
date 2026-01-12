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
    <div className="bg-slate-900 border border-slate-700 shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Create Competition</h3>
      <p className="text-sm text-slate-400 mb-4">Start a new coding competition and invite others using the room code.</p>

      <div className="space-y-3">
        <input
          className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white placeholder-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            className="w-4 h-4 accent-sky-500"
          />
          Private room
        </label>

        <div className="flex justify-end pt-2">
          <button
            className="px-6 py-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all text-sm"
            onClick={handleCreate}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
