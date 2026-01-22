import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import RoomDisplay from "./RoomDisplay";
import AdminRoom from "./AdminRoom";
import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";

export default function Lobby() {
  const { user } = useAuth();
  const { myRoom, setMyRoom, loading } = useRoom();

  async function handleLeave() {
    if (!myRoom || !user?.id) return;

    try {
      console.log("Leaving room:", myRoom.id, "for user:", user.id);
      await api.post(`/rooms/${myRoom.id}/leave`, { playerId: user.id });
      setMyRoom(null);
    } catch (err) {
      console.error("Error leaving room:", err);
      if (err.response?.status === 403 || err.response?.status === 410) {
        setMyRoom(null);
      }
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {!myRoom ? (
        <>
          <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
          <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
        </>
      ) : (
        <>
          <RoomDisplay
            room={myRoom}
            currentUser={user}
            onLeave={handleLeave}
          />

          {myRoom.admin?.id === user?.id && (
            <AdminRoom
              roomId={myRoom.id}
              adminId={user?.id}
              onDelete={() => setMyRoom(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
