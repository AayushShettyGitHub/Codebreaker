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

  if (authLoading || roomLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 container max-w-7xl mx-auto py-8 px-6">
        {!myRoom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="transform hover:scale-105 transition-all">
              <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
            </div>
            <div className="transform hover:scale-105 transition-all">
              <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 auto-rows-max">
              <div className="lg:col-span-1 h-fit">
                <RoomDisplay
                  room={myRoom}
                  currentUser={user}
                  onLeave={handleLeave}
                />
              </div>

              <div className="lg:col-span-2 space-y-8">
                {myRoom.admin?.id === user?.id && (
                  <div className="h-fit">
                    <AdminRoom
                      roomId={myRoom.id}
                      adminId={user?.id}
                      playerId={user?.id}
                      onDelete={() => setMyRoom(null)}
                    />
                  </div>
                )}

                {myRoom.admin?.id !== user?.id && (
                  <div className="h-fit">
                    <Submit
                      roomId={myRoom.id}
                      playerId={user?.id}
                      problemId={myRoom.currentProblem?.id}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
