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
        <h3 className="text-lg font-semibold text-[#e8e6e3] mb-1">Create Room</h3>
        <p className="text-sm text-[#6b6560]">Start a new competition room.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-[#a8a29e] mb-2">Room Name</label>
          <input
            className="w-full px-4 py-3 bg-[#141118] border border-[#1e1215] rounded-lg text-[#e8e6e3] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-[#44403c]"
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
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isPrivate ? 'bg-red-600 border-red-600' : 'border-[#2a1519] group-hover:border-red-500/40'}`}>
            {isPrivate && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[#a8a29e] group-hover:text-[#e8e6e3] transition-colors">Private Room</span>
        </label>

        <button
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all hover:shadow-[0_4px_20px_rgba(220,38,38,0.3)] active:scale-[0.98]"
          onClick={handleCreate}
        >
          Create Room
        </button>
      </div>
    </div>
  );
}
