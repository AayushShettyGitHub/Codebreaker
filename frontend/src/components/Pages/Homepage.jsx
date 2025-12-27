import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CreateRoom from "../RoomComponents/CreateRoom";
import JoinRoom from "../RoomComponents/JoinRoom";
import RoomDisplay from "../RoomComponents/RoomDisplay";
import AdminRoom from "../RoomComponents/AdminRoom";
import Submit from "../RoomComponents/Submit";
import Navbar from "../MainComponents/Navbar";

import api from "../../config/client";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const { myRoom, setMyRoom, loading: roomLoading } = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // ✅ leave handler (same logic as Lobby)
  async function handleLeave() {
    if (!myRoom || !user?.id) return;

    try {
      await api.post(`/rooms/${myRoom.id}/leave`, {
        playerId: user.id,
      });
      setMyRoom(null);
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  }

  if (authLoading || roomLoading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="container py-8">
        {!myRoom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
            <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* ✅ FIX: pass onLeave */}
              <RoomDisplay
                room={myRoom}
                currentUser={user}
                onLeave={handleLeave}
              />

              <div className="space-y-4">
                {myRoom.admin?.id === user?.id && (
                  <AdminRoom
                    roomId={myRoom.id}
                    adminId={user?.id}
                    onDelete={() => setMyRoom(null)}
                  />
                )}

                <Submit
                  roomId={myRoom.id}
                  playerId={user?.id}
                  problemId={myRoom.currentProblem?.id}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
