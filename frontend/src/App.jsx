import { useState } from "react";
import Signup from "./components/AuthComponents/Signup";
import Login from "./components/AuthComponents/Login";
import CreateRoom from "./components/RoomComponents/CreateRoom";
import JoinRoom from "./components/RoomComponents/JoinRoom";
import AdminRoom from "./components/RoomComponents/AdminRoom";
import Submit from "./components/RoomComponents/Submit";
import RoomDisplay from "./components/RoomComponents/RoomDisplay";

export default function App() {
  const [playerId, setPlayerId] = useState(null);
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h1>CodeBreaker Test UI</h1>

      {!playerId && (
        <>
          <Signup onSignup={(p) => { setPlayer(p); setPlayerId(p.id); }} />
          <Login onLogin={(id) => setPlayerId(id)} />
        </>
      )}

      {playerId && !room && (
        <>
          <CreateRoom playerId={playerId} onCreate={setRoom} />
          <JoinRoom playerId={playerId} onJoin={setRoom} />
        </>
      )}

      {room && (
        <>
          <RoomDisplay room={room} />

          {room.admin?.id === playerId && (
            <AdminRoom roomId={room.id} />
          )}

          <Submit roomId={room.id} playerId={playerId} />
        </>
      )}
    </div>
  );
}
