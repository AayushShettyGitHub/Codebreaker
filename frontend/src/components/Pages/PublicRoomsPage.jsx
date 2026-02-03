import AvailableRooms from "../RoomComponents/AvailableRooms";
import { useRoom } from "../../context/RoomContext";
import { useAuth } from "../../context/AuthContext";

export default function PublicRoomsPage() {
  const { setMyRoom } = useRoom();
  const { user } = useAuth();

  return (
    <main className="flex-1">
      <div className="container max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold mb-4">Public Rooms</h1>
        <p className="text-slate-600 mb-6">Browse and join active public competitions.</p>
        <AvailableRooms onJoin={setMyRoom} />
      </div>
    </main>
  );
}
