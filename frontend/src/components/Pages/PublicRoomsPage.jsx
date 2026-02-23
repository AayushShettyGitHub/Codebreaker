import AvailableRooms from "../RoomComponents/AvailableRooms";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { Globe } from "lucide-react";

export default function PublicRoomsPage() {
    const { setMyRoom } = useRoom();
    const { user } = useAuth();

    return (
        <main className="flex-1 bg-[#0a0a0f]">
            <div className="max-w-[1440px] mx-auto py-12 px-8 md:px-16 lg:px-20">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Globe size={20} className="text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#e8e6e3]">Public Rooms</h1>
                    </div>
                    <p className="text-sm text-[#6b6560] max-w-lg">
                        Browse available public rooms and join a competition.
                    </p>
                </header>

                <AvailableRooms onJoin={setMyRoom} />
            </div>
        </main>
    );
}
