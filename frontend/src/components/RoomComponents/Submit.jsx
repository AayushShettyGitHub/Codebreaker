import { useState } from "react";
import api from "../../config/client";


export default function Submit({ roomId, playerId }) {
  const [txt, setTxt] = useState("");

  async function handleSubmit() {
    const res = await api.post(`/rooms/${roomId}/submit-answer`, {
      playerId,
      answer: txt
    });
    alert(res.data.message);
  }

  return (
    <div>
      <h3>Submit Answer</h3>
      <input
        placeholder="Your answer"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
