import { useState } from "react";
import api from "../../config/client";


export default function CreateRoom({ playerId, onCreate }) {
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  async function handleCreate() {
    const res = await api.post("/rooms", {
      name,
      privateRoom: isPrivate,
      adminPlayerId: playerId
    });
    onCreate(res.data);
  }

  return (
    <div>
      <h3>Create Room</h3>
      <input
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={() => setIsPrivate(!isPrivate)}
        />
        Private
      </label>

      <button onClick={handleCreate}>Create Room</button>
    </div>
  );
}
