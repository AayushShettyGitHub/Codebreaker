import { useState } from "react";
import api from "../../config/client";


export default function JoinRoom({ playerId, onJoin }) {
  const [roomId, setRoomId] = useState("");

  async function handleJoin() {
    const res = await api.post(`/rooms/${roomId}/join`, {
      playerId
    });
    onJoin(res.data.room);
  }

  return (
    <div>
      <h3>Join Room</h3>
      <input
        placeholder="Room ID"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
