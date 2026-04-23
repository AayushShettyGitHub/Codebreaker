import AvailableRooms from "../RoomComponents/AvailableRooms";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";
import { Globe } from "lucide-react";

export default function PublicRoomsPage() {
    const { setMyRoom } = useRoom();
    const { user } = useAuth();

    return (
        <main className="flex-1 bg-[#09090b]">
            <div className="max-w-[1440px] mx-auto py-12 px-6 md:px-10 lg:px-16">
                <header className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Globe size={20} className="text-indigo-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#e4e4e7]">Public Rooms</h1>
                    </div>
                    <p className="text-sm text-[#71717a] max-w-lg">
                        Browse available public rooms and join a competition.
                    </p>
                </header>

                <AvailableRooms onJoin={setMyRoom} />
            </div>
        </main>
    );
}
