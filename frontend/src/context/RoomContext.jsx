import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../config/client";
import { useAuth } from "./AuthContext";

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const { user } = useAuth();

  const [myRoom, setMyRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const roomPollingRef = useRef(null);
  const playersPollingRef = useRef(null);

  const fetchMyRoom = useCallback(async () => {
    if (!user) {
      setMyRoom(null);
      setPlayers([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/rooms/me");
      const roomData = res.data || null;
      setMyRoom(roomData);
    } catch (err) {
      console.error("Error fetching room:", err);
      setMyRoom(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPlayers = useCallback(async (roomId) => {
    if (!roomId) return;

    try {
      const res = await api.get(`/players/room/${roomId}`);
      console.log("Fetched players:", res.data);
      setPlayers(res.data || []);
    } catch (err) {
      console.error("Error fetching players:", err);
      setPlayers([]);
    }
  }, []);

  useEffect(() => {
    fetchMyRoom();
  }, [fetchMyRoom]);

  useEffect(() => {
    if (!myRoom?.id) return;

    const pollRoom = async () => {
      try {
        const res = await api.get(`/rooms/${myRoom.id}`);
        setMyRoom(res.data || null);
      } catch (err) {
        console.error("Room polling failed:", err);
      }
    };

    pollRoom();
    roomPollingRef.current = setInterval(pollRoom, 10000); // Poll every 10 seconds

    const pollPlayers = async () => fetchPlayers(myRoom.id);
    pollPlayers();
    playersPollingRef.current = setInterval(pollPlayers, 15000); // Poll every 15 seconds

    return () => {
      if (roomPollingRef.current) clearInterval(roomPollingRef.current);
      if (playersPollingRef.current) clearInterval(playersPollingRef.current);
    };
  }, [myRoom?.id, fetchPlayers]);

  return (
    <RoomContext.Provider
      value={{
        myRoom,
        players,
        setMyRoom,
        fetchMyRoom,
        fetchPlayers,
        loading
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}
