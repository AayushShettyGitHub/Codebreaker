import { useState } from "react";
import { useRoom } from "../../context/RoomContext";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";

export default function CreateRoom({ playerId, onCreate }) {
  const { fetchPlayers } = useRoom();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleCreate() {
    if (!playerId) {
      toastError("Player not logged in");
      return;
    }

    if (!name.trim()) {
      toastError("Room name cannot be empty");
      return;
    }

    try {
      const res = await api.post("/rooms", {
        name,
        privateRoom: isPrivate,
        playerId: playerId
      });
      toastSuccess("Room created successfully!");
      const roomData = res.data;
      console.log("Successfully created room:", roomData);
      onCreate(roomData);
      
      if (roomData?.id) {
        console.log("📥 Fetching players for room:", roomData.id);
        setTimeout(() => {
          fetchPlayers(roomData.id);
          console.log("Players fetch triggered for room:", roomData.id);
        }, 100);
      }
    } catch (err) {
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        toastError(getErrorMessage(err));
      } catch (e) {
        toastError("Error creating room");
      }
    }
  }

  return (
    <div className="bg-white border border-gray-300 shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Create Competition</h3>
      <p className="text-sm text-gray-600 mb-4">Start a new coding competition and invite others using the room code.</p>

      <div className="space-y-3">
        <input
          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            className="w-4 h-4 accent-blue-600"
          />
          Private room
        </label>

        <div className="flex justify-end pt-2">
          <button
            className="px-6 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all text-sm"
            onClick={handleCreate}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
