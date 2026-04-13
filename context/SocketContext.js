// context/SocketContext.js
// Global socket connection manager for real-time features
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import Config from "../constants/Config";
import { AppState } from "react-native";

const SocketContext = createContext();

// Get socket URL - strip /api from API_URL
const getSocketUrl = () => {
  if (!Config.API_URL) {
    throw new Error("API_URL is not defined in Config");
  }
  const socketUrl = Config.API_URL.replace("/api", "");
  console.log("🔌 Socket URL:", socketUrl);
  return socketUrl;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("✅ Socket already connected");
      return socketRef.current;
    }

    const socketUrl = getSocketUrl();
    console.log("🔌 Connecting to socket:", socketUrl);

    socketRef.current = io(socketUrl, {
      transports: ["polling", "websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected:", socketRef.current.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
      setConnectionError(error.message);
      reconnectAttempts.current += 1;
    });

    socketRef.current.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
      setConnectionError(null);
    });

    socketRef.current.on("reconnect_failed", () => {
      console.error("🔴 Socket reconnection failed after max attempts");
      setConnectionError("Failed to reconnect after multiple attempts");
    });

    return socketRef.current;
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("🔌 Disconnecting socket...");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Get current socket instance
  const getSocket = useCallback(() => socketRef.current, []);

  // Join a tracking room (for hosts to receive location updates)
  const joinTracking = useCallback(
    (bookingId) => {
      if (!socketRef.current?.connected) {
        console.warn("⚠️ Socket not connected, connecting now...");
        connect();
      }
      socketRef.current?.emit("join_tracking", bookingId);
      console.log("📡 Joined tracking room:", bookingId);
    },
    [connect],
  );

  // Send location update (for customers during ongoing trips)
  const sendLocation = useCallback((bookingId, coords) => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Socket not connected, cannot send location");
      return false;
    }

    socketRef.current.emit("send_location", {
      bookingId,
      lat: coords.latitude,
      lng: coords.longitude,
      heading: coords.heading || 0,
      speed: coords.speed || 0,
      timestamp: new Date().toISOString(),
    });

    console.log(
      "📍 Location sent:",
      coords.latitude.toFixed(6),
      coords.longitude.toFixed(6),
    );
    return true;
  }, []);

  // Listen for location updates (for hosts)
  const onLocationUpdate = useCallback((callback) => {
    if (!socketRef.current) return;
    socketRef.current.on("receive_location", callback);
  }, []);

  // Stop listening for location updates
  const offLocationUpdate = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.off("receive_location");
  }, []);

  // Handle app state changes (reconnect when app comes to foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !socketRef.current?.connected) {
        console.log("📱 App active, reconnecting socket...");
        connect();
      }
    });

    return () => subscription?.remove();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
    getSocket,
    joinTracking,
    sendLocation,
    onLocationUpdate,
    offLocationUpdate,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
