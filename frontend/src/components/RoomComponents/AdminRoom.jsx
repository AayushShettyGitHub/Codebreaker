import { useState } from "react";
import api from "../../config/client";


export default function AdminProblem({ roomId }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [answer, setAnswer] = useState("");

  async function handlePost() {
    await api.post(`/rooms/${roomId}/problem`, {
      title,
      description: desc,
      answer
    });
    alert("Problem posted");
  }

  return (
    <div>
      <h3>Post Problem</h3>

      <input placeholder="Title" onChange={e => setTitle(e.target.value)} />

      <textarea
        placeholder="Description"
        onChange={e => setDesc(e.target.value)}
      />

      <input
        placeholder="Correct Answer"
        onChange={e => setAnswer(e.target.value)}
      />

      <button onClick={handlePost}>Post</button>
    </div>
  );
}
