import { useState } from "react";
import JoinRoom from "../RoomComponents/JoinRoom";
import CreateRoom from "../RoomComponents/CreateRoom";
import RoomDisplay from "../RoomComponents/RoomDisplay";
import AdminRoom from "../RoomComponents/AdminRoom";
import Submit from "../RoomComponents/Submit";
import { useAuth } from "../../context/AuthContext";
import { useRoom } from "../../context/RoomContext";
import api from "../../config/client";
import { Swords, Plus, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";

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

    if (myRoom) {
        return (
            <main className="flex-1 bg-[#09090b]">
                <div className="max-w-[1440px] mx-auto py-8 px-6 md:px-10 lg:px-16 w-full">
                    <div className="space-y-6">
                        {/* Mobile header */}
                        <div className="lg:hidden flex justify-between items-center rounded-xl border border-[#1c1c22] bg-[#0f0f13] px-5 py-4">
                            <h2 className="text-sm font-semibold text-[#e4e4e7]">{myRoom.name}</h2>
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg border border-[#1c1c22] text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#141419] transition-all"
                            >
                                {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Sidebar */}
                            <div
                                className={`${sidebarOpen ? "block" : "hidden lg:block"
                                    } lg:col-span-1 h-fit animate-in`}
                            >
                                <RoomDisplay
                                    room={myRoom}
                                    currentUser={user}
                                    onLeave={handleLeave}
                                />
                            </div>

                            {/* Main content */}
                            <div
                                className="lg:col-span-3 space-y-6 animate-in"
                                style={{ animationDelay: "0.1s" }}
                            >
                                {myRoom.admin?.id === user?.id && (
                                    <AdminRoom
                                        roomId={myRoom.id}
                                        adminId={user?.id}
                                        playerId={user?.id}
                                        onDelete={() => setMyRoom(null)}
                                    />
                                )}

                                {myRoom.admin?.id !== user?.id && (
                                    <Submit
                                        roomId={myRoom.id}
                                        playerId={user?.id}
                                        problemId={myRoom.currentProblem?.id}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // No room joined
    return (
        <main className="flex-1 bg-[#09090b]">
            <div className="max-w-[1440px] mx-auto py-10 px-6 md:px-10 lg:px-16">
                <div className="text-center mb-12 animate-in">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 mb-5">
                        <Swords size={22} className="text-indigo-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#e4e4e7] mb-3">
                        Competition Arena
                    </h1>
                    <p className="text-[#71717a] text-sm max-w-md mx-auto">
                        Join an existing room or create your own to start solving problems in real-time.
                    </p>
                </div>

                {/* Tabs */}
                <div
                    className="flex p-1 bg-[#0f0f13] border border-[#1c1c22] rounded-xl mb-6 animate-in"
                    style={{ animationDelay: "0.1s" }}
                >
                    <button
                        onClick={() => setActiveTab("join")}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "join"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-[#71717a] hover:text-[#a1a1aa]"
                            }`}
                    >
                        <ChevronRight size={16} />
                        Join Room
                    </button>
                    <button
                        onClick={() => setActiveTab("create")}
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === "create"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-[#71717a] hover:text-[#a1a1aa]"
                            }`}
                    >
                        <Plus size={16} />
                        Create Room
                    </button>
                </div>

                {/* Content */}
                <div
                    className="rounded-xl border border-[#1c1c22] bg-[#0f0f13] p-8 animate-in"
                    style={{ animationDelay: "0.15s" }}
                >
                    {activeTab === "join" ? (
                        <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
                    ) : (
                        <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
                    )}
                </div>
            </div>
        </main>
    );
}
