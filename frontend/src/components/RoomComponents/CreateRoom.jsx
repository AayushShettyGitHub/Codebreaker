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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#e4e4e7] mb-1">Create Room</h3>
        <p className="text-sm text-[#71717a]">Start a new competition room.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#a1a1aa] mb-2">Room Name</label>
          <input
            className="w-full px-4 py-3 bg-[#141419] border border-[#1c1c22] rounded-lg text-[#e4e4e7] text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-[#3f3f46]"
            placeholder="My Awesome Room"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            className="hidden"
          />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isPrivate ? 'bg-indigo-600 border-indigo-600' : 'border-[#27272a] group-hover:border-indigo-500/40'}`}>
            {isPrivate && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[#a1a1aa] group-hover:text-[#e4e4e7] transition-colors">Private Room</span>
        </label>

        <button
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
          onClick={handleCreate}
        >
          Create Room
        </button>
      </div>
    </div>
  );
}
