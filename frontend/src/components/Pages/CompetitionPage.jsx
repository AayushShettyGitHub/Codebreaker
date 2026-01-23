import { useState } from "react";
import JoinRoom from "../RoomComponents/JoinRoom";
import CreateRoom from "../RoomComponents/CreateRoom";
import RoomDisplay from "../RoomComponents/RoomDisplay";
import AdminRoom from "../RoomComponents/AdminRoom";
import Submit from "../RoomComponents/Submit";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import api from "../../config/client";

export default function CompetitionPage() {
  const { user } = useAuth();
  const { myRoom, setMyRoom } = useRoom();
  const [activeTab, setActiveTab] = useState("join");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // If user is already in a room, show room display
  if (myRoom) {
    return (
      <main className="flex-1 bg-white">
        <div className="container max-w-7xl mx-auto py-8 px-6 w-full">
          <div className="space-y-6">
            <div className="md:hidden flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">{myRoom.name}</h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-700 transition-all"
              >
                <span className="text-xl">{sidebarOpen ? "✕" : "☰"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 auto-rows-max">
              <div className={`${
                sidebarOpen ? "block" : "hidden md:block"
              } lg:col-span-1 h-fit`}>
                <RoomDisplay
                  room={myRoom}
                  currentUser={user}
                  onLeave={handleLeave}
                />
              </div>

              <div className="lg:col-span-3 space-y-6">
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
        </div>
      </main>
    );
  }

  // If no room, show join/create interface
  return (
    <main className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Join or Create a Room</h1>
          <p className="text-lg text-gray-600">Choose to join an existing competition or start a new one</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("join")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "join"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            🔗 Join Room
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            ➕ Create Room
          </button>
        </div>

        <div className="max-w-md mx-auto">
          {activeTab === "join" && (
            <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
          )}
          {activeTab === "create" && (
            <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
          )}
        </div>
      </div>
    </main>
  );
}
