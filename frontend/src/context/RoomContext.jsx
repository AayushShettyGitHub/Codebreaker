import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../config/client";
import { useAuth } from "./AuthContext";
import websocketService from "../services/websocketService";
import { toastError } from "../utils/toast";

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const { user } = useAuth();

  const [myRoom, setMyRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);
  const [onKickNavigate, setOnKickNavigate] = useState(null);

  const roomPollingRef = useRef(null);
  const playersPollingRef = useRef(null);
  const wsSubscriptionsRef = useRef({});

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
    if (!user) return;

    const handleWSConnected = () => {
      setWsConnected(true);
      console.log("WebSocket connected in RoomProvider");
    };

    const handleWSError = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    websocketService.connect(handleWSConnected, handleWSError);

    return () => {
      websocketService.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!myRoom?.id || !wsConnected) return;

    const roomTopic = `/topic/room/${myRoom.id}`;

    const handleRoomMessage = (message) => {
      console.log("🔔 WebSocket Room message received:", message);

      if (message.type === "PLAYER_JOINED") {
        console.log("✅ Player joined:", message.player);
        fetchPlayers(myRoom.id);
      } else if (message.type === "PLAYER_LEFT") {
        console.log("❌ Player left:", message.player);
        fetchPlayers(myRoom.id);
      } else if (message.type === "PLAYER_KICKED") {
        console.log("👢 Player kicked:", message.playerId);
        if (message.playerId === user?.id) {
          setKickedOut(true);
          toastError(`You have been kicked from the room!`);
        } else {
          fetchPlayers(myRoom.id);
        }
      } else if (message.type === "ROOM_UPDATED") {
        console.log("🔄 Room updated:", message.room);
        setMyRoom(message.room);
      } else if (message.type === "PROBLEM_SET") {
        console.log("📝 Problem set:", message.problem);
        fetchMyRoom();
      } else if (message.type === "PROBLEM_STARTED") {
        console.log("🚀 Problem started:", message.problem);
        fetchMyRoom();
      } else if (message.type === "PROBLEM_ENDED") {
        console.log("⏹️ Problem ended");
        fetchMyRoom();
      } else if (message.type === "MAX_CORRECT_SET") {
        console.log("🎯 Max correct set:", message.maxCorrectAnswers);
        setMyRoom((prev) =>
          prev
            ? { ...prev, maxCorrectAnswers: message.maxCorrectAnswers }
            : null
        );
      } else if (message.type === "SCORE_UPDATE") {
        console.log("⭐ Score update:", message);
        fetchPlayers(myRoom.id);
      } else if (message.type === "SUBMISSION_RECEIVED") {
        console.log("📤 Submission received from:", message.playerUsername);
      } else if (message.type === "SUBMISSION_RESULT") {
        console.log("📊 Submission result:", message.result);
      } else if (message.type === "ROOM_DELETED") {
        console.log("🗑️ Room deleted");
        setMyRoom(null);
        setPlayers([]);
      }
    };

    console.log("🔗 Subscribing to room topic:", roomTopic);
    websocketService.subscribe(roomTopic, handleRoomMessage);
    wsSubscriptionsRef.current[roomTopic] = true;

    return () => {
      console.log("🔗 Unsubscribing from room topic:", roomTopic);
      websocketService.unsubscribe(roomTopic);
      delete wsSubscriptionsRef.current[roomTopic];
    };
  }, [wsConnected, myRoom?.id, fetchPlayers, fetchMyRoom, user?.id]);


  useEffect(() => {
    fetchMyRoom();
  }, [fetchMyRoom]);

  useEffect(() => {
    if (!myRoom?.id) return;

    // Always poll as fallback, but with different intervals based on WS connection
    const pollRoom = async () => {
      try {
        const res = await api.get(`/rooms/${myRoom.id}`);
        setMyRoom(res.data || null);
      } catch (err) {
        console.error("Room polling failed:", err);
      }
    };

    const pollPlayers = async () => {
      try {
        const res = await api.get(`/players/room/${myRoom.id}`);
        console.log("Polling - Fetched players:", res.data);
        setPlayers(res.data || []);
      } catch (err) {
        console.error("Players polling failed:", err);
      }
    };

    pollRoom();
    pollPlayers();

    const pollInterval = wsConnected ? 5000 : 2000;
    roomPollingRef.current = setInterval(pollRoom, pollInterval);
    playersPollingRef.current = setInterval(pollPlayers, pollInterval);

    return () => {
      if (roomPollingRef.current) clearInterval(roomPollingRef.current);
      if (playersPollingRef.current) clearInterval(playersPollingRef.current);
    };
  }, [myRoom?.id, wsConnected]);

  useEffect(() => {
    if (!wsConnected || !myRoom?.id) return;

    // When WS connects, immediately fetch fresh data
    fetchMyRoom();
    fetchPlayers(myRoom.id);
  }, [wsConnected, myRoom?.id, fetchMyRoom, fetchPlayers]);

  return (
    <RoomContext.Provider
      value={{
        myRoom,
        players,
        setMyRoom,
        fetchMyRoom,
        fetchPlayers,
        loading,
        wsConnected,
        kickedOut,
        setKickedOut,
        onKickNavigate,
        setOnKickNavigate,
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
