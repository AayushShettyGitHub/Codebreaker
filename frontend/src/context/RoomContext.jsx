import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../config/client";
import { useAuth } from "./AuthContext";

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const { user } = useAuth();
  const [myRoom, setMyRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMyRoom = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/rooms/me"); // backend uses authenticated user
      console.log("Fetched room:", res.data);
      setMyRoom(res.data || null);
    } catch (err) {
      setMyRoom(null);
      console.error("Error fetching room:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchMyRoom();
  }, [user, fetchMyRoom]);

  return (
    <RoomContext.Provider value={{ myRoom, setMyRoom, fetchMyRoom, loading }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  return useContext(RoomContext);
}
