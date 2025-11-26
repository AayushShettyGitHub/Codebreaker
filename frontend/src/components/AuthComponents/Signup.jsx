import { useState } from "react";
import api from "../../config/client";

export default function Signup({ onSignup }) {
  const [name, setName] = useState("");

  async function handleSignup() {
    const res = await api.post("/players/signup", { name });
    onSignup(res.data);
  }

  return (
    <div>
      <h3>Signup</h3>
      <input
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}
