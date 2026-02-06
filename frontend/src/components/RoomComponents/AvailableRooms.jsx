import { useEffect, useState } from "react";
import api from "../../config/client";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import { useNavigate } from "react-router-dom";
import websocketService from "../../services/websocketService";
import { toastError, toastSuccess } from "../../utils/toast";

export default function AvailableRooms({ onJoin }) {
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();
  const { myRoom } = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();

    const handleRoomsMessage = (message) => {
      if (!message || !message.type) return;

      if (message.type === "ROOM_CREATED") {
        const r = message.room;
        if (!r || r.privateRoom) return;
        setRooms((prev) => (prev.some((x) => x.id === r.id) ? prev : [r, ...prev]));
      } else if (message.type === "ROOM_DELETED") {
        setRooms((prev) => prev.filter((x) => x.id !== message.roomId));
      } else if (message.type === "ROOM_UPDATED") {
        setRooms((prev) => prev.map((x) => (x.id === message.room.id ? message.room : x)));
      }
    };

    websocketService.subscribe("/topic/rooms", handleRoomsMessage);
    return () => websocketService.unsubscribe("/topic/rooms");
  }, []);

  async function fetchRooms() {
    try {
      const res = await api.get("/rooms/public");
      setRooms(res.data || []);
    } catch (err) {
      console.error("Failed to fetch public rooms", err);
    }
  }

  async function handleJoin(room) {
    if (!user?.id) {
      toastError("Please login to join a room");
      return;
    }

    if (myRoom) {
      toastError("You are already in a room. Leave it before joining another.");
      return;
    }

    try {
      const res = await api.post(`/rooms/${room.id}/join`, { playerId: user.id });
      toastSuccess("Joined room");
      if (onJoin) onJoin(res.data);
      navigate("/compete");
    } catch (err) {
      try {
        const { getErrorMessage } = await import("../../utils/errors");
        toastError(getErrorMessage(err));
      } catch (e) {
        toastError("Failed to join room");
      }
      console.error("Failed to join room", err);
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold mb-4">Available Rooms</h3>
      {rooms.length === 0 && (
        <p className="text-slate-600">No public rooms available right now.</p>
      )}

      <div className="space-y-3">
        {rooms.map((room) => (
          <div key={room.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
            <div>
              <p className="font-semibold text-slate-900">{room.name || `Room ${room.id}`}</p>
              <p className="text-sm text-slate-500">Players: {room.playersCount || 0} • Min to start: {room.minPlayersToStart || 1}</p>
            </div>
            <div>
              <button
                onClick={() => handleJoin(room)}
                disabled={!!myRoom}
                className={`px-4 py-2 rounded-lg ${myRoom ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
