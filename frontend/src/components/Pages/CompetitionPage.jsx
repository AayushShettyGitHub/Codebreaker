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
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto py-8 px-6 w-full">
          <div className="space-y-6">
            <div className="md:hidden flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">{myRoom.name}</h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 transition-all"
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
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Start Competing</h1>
          <p className="text-lg text-slate-600">Join an existing room or create your own competition</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-12 border-b border-slate-200 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "join"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Room
          </button>
        </div>

        {/* Forms Grid */}
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className={activeTab === "join" ? "" : "hidden md:block opacity-30 pointer-events-none"}>
            <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
          </div>
          <div className={activeTab === "create" ? "" : "hidden md:block opacity-30 pointer-events-none"}>
            <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
          </div>
          <div className="md:hidden">
            {activeTab === "join" ? (
              <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
            ) : (
              <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
