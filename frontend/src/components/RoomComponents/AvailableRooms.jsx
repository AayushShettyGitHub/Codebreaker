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
                <div className="w-8 h-8 border-2 border-[#1e1215] border-t-red-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Globe size={18} className="text-red-400" />
                    <h2 className="text-lg font-semibold text-[#e8e6e3]">Public Arena</h2>
                </div>
                <span className="text-xs text-[#6b6560] font-medium">{rooms.length} active rooms</span>
            </div>

            {rooms.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-[#1e1215] bg-[#0f0d12]">
                    <p className="text-sm text-[#44403c]">No public rooms active right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="flex items-center justify-between p-5 rounded-xl border border-[#1e1215] bg-[#0f0d12] hover:border-red-500/20 hover:bg-[#141118] transition-all group animate-in"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <Users size={20} className="text-red-400" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0f0d12] rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-[#e8e6e3] group-hover:text-red-400 transition-colors">
                                        {room.name}
                                    </h3>
                                    <p className="text-xs text-[#6b6560] mt-1">
                                        Host: <span className="text-[#a8a29e]">{room.admin?.username || "Admin"}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleJoin(room)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#141118] border border-[#1e1215] text-[#a8a29e] hover:text-white hover:bg-red-600 hover:border-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all text-sm font-medium"
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
