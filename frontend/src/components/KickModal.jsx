import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";

export default function KickModal() {
  const { kickedOut, setKickedOut } = useRoom();
  const navigate = useNavigate();

  useEffect(() => {
    if (kickedOut) {
      const timer = setTimeout(() => {
        setKickedOut(false);
        navigate("/home");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [kickedOut, setKickedOut, navigate]);

  if (!kickedOut) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-red-500 rounded-lg p-8 max-w-sm text-center">
        <div className="text-4xl mb-4">👢</div>
        <h2 className="text-2xl font-bold text-red-400 mb-4">You have been kicked!</h2>
        <p className="text-slate-300 mb-6">You have been removed from the room by the admin.</p>
        <button
          onClick={() => {
            setKickedOut(false);
            navigate("/home");
          }}
          className="w-full py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all"
        >
          OK
        </button>
        <p className="text-xs text-slate-500 mt-4">Redirecting in 3 seconds...</p>
      </div>
    </div>
  );
}
