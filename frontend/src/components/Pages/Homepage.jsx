import { useEffect, useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 flex flex-col">

      <main className="flex-1 container max-w-7xl mx-auto py-4 md:py-8 px-4 md:px-12 w-full">
        {!myRoom ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
            <div className="transform hover:scale-105 transition-all">
              <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
            </div>
            <div className="transform hover:scale-105 transition-all">
              <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <div className="md:hidden flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">{myRoom.name}</h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 transition-all"
              >
                <span className="text-xl">{sidebarOpen ? "✕" : "☰"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-max">
              <div className={`${
                sidebarOpen ? "block" : "hidden md:block"
              } lg:col-span-1 h-fit`}>
                <RoomDisplay
                  room={myRoom}
                  currentUser={user}
                  onLeave={handleLeave}
                />
              </div>

              <div className="lg:col-span-3 space-y-6 md:space-y-8">
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
