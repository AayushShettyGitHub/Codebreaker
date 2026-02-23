import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateRoom from "../RoomComponents/CreateRoom";
import JoinRoom from "../RoomComponents/JoinRoom";
import RoomDisplay from "../RoomComponents/RoomDisplay";
import AdminRoom from "../RoomComponents/AdminRoom";
import Submit from "../RoomComponents/Submit";
import Navbar from "../MainComponents/Navbar";
import AvailableRooms from "../RoomComponents/AvailableRooms";

import api from "../../config/client";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { Home, Plus, ChevronRight, Globe } from "lucide-react";

export default function Homepage() {
    const { user } = useAuth();
    const { myRoom, setMyRoom, loading: roomLoading } = useRoom();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("join");

    async function handleLeave() {
        if (!myRoom || !user?.id) return;
        try {
            await api.post(`/rooms/${myRoom.id}/leave`, { playerId: user.id });
            setMyRoom(null);
        } catch (err) {
            console.error("Error leaving room:", err);
        }
    }

    if (roomLoading) {
        return (
            <main className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 border-2 border-[#1e1215] border-t-red-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-[#6b6560]">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-[#0a0a0f]">
            <div className="max-w-[1440px] mx-auto py-10 px-8 md:px-16 lg:px-20">
                {}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Home size={20} className="text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#e8e6e3]">
                                Welcome, <span className="text-red-400">{user?.username}</span>
                            </h1>
                            <p className="text-sm text-[#6b6560]">Your coding dashboard</p>
                        </div>
                    </div>
                </div>

                {myRoom ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {}
                        <div className="lg:col-span-1 h-fit animate-in">
                            <RoomDisplay
                                room={myRoom}
                                currentUser={user}
                                onLeave={handleLeave}
                            />
                        </div>

                        {}
                        <div className="lg:col-span-3 space-y-6 animate-in" style={{ animationDelay: "0.1s" }}>
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
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {}
                        <div className="lg:col-span-1">
                            <div className="rounded-xl border border-[#1e1215] bg-[#0f0d12] overflow-hidden animate-in">
                                <div className="flex p-1 m-4 bg-[#141118] rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("join")}
                                        className={`flex-1 py-2.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === "join"
                                            ? "bg-red-600 text-white"
                                            : "text-[#6b6560] hover:text-[#a8a29e]"
                                            }`}
                                    >
                                        <ChevronRight size={14} /> Join
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("create")}
                                        className={`flex-1 py-2.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === "create"
                                            ? "bg-red-600 text-white"
                                            : "text-[#6b6560] hover:text-[#a8a29e]"
                                            }`}
                                    >
                                        <Plus size={14} /> Create
                                    </button>
                                </div>

                                <div className="px-6 pb-6">
                                    {activeTab === "join" ? (
                                        <JoinRoom playerId={user?.id} onJoin={setMyRoom} />
                                    ) : (
                                        <CreateRoom playerId={user?.id} onCreate={setMyRoom} />
                                    )}
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="lg:col-span-2 animate-in" style={{ animationDelay: "0.1s" }}>
                            <AvailableRooms onJoin={setMyRoom} />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
