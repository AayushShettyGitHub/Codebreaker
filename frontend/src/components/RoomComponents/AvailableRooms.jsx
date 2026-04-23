import { useEffect, useState } from "react";
import api from "../../config/client";
import { toastError, toastSuccess } from "../../utils/toast";
import { Users, Globe, ChevronRight } from "lucide-react";

export default function AvailableRooms({ onJoin }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRooms = async () => {
        try {
            const res = await api.get("/rooms/public");
            setRooms(res.data || []);
        } catch (err) {
            console.error("Failed to fetch public rooms", err);
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        const interval = setInterval(fetchRooms, 30000); 
        return () => clearInterval(interval);
    }, []);

    async function handleJoin(room) {
        try {
            const res = await api.post("/rooms/join", {
                joinCode: room.joinCode
            });
            toastSuccess(`Joined ${room.name}`);
            onJoin(res.data);
        } catch (err) {
            console.error("Join failed", err);
            toastError("Failed to join room");
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#1c1c22] border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Globe size={18} className="text-indigo-400" />
                    <h2 className="text-lg font-semibold text-[#e4e4e7]">Public Arena</h2>
                </div>
                <span className="text-xs text-[#71717a] font-medium">{rooms.length} active rooms</span>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-[#1c1c22] bg-[#0f0f13]">
                    <p className="text-sm text-[#3f3f46]">No public rooms active right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between p-5 rounded-xl border border-[#1c1c22] bg-[#0f0f13] hover:border-indigo-500/20 hover:bg-[#141419] transition-all group animate-in"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                        <Users size={20} className="text-indigo-400" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f0f13] rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#e4e4e7] group-hover:text-indigo-400 transition-colors">
                                        {room.name}
                                    </h3>
                                    <p className="text-xs text-[#71717a] mt-1">
                                        Host: <span className="text-[#a1a1aa]">{room.admin?.username || "Admin"}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleJoin(room)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141419] border border-[#1c1c22] text-[#a1a1aa] hover:text-white hover:bg-indigo-600 hover:border-indigo-600 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all text-sm font-medium"
                            >
                                Join Room <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
