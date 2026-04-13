// services/socketService.js
import { io } from "socket.io-client";
import Config from "../constants/Config";

let socket = null;

// Get socket URL - for WebSockets, we need a server that supports it
// Vercel serverless doesn't support WebSockets, so use local or dedicated socket server
const getSocketUrl = () => {
    // If using local development, use local IP
    // If using production, you need a dedicated WebSocket server (not Vercel)
    const apiUrl = Config.API_URL || "http://192.168.1.11:5000/api";
    const socketUrl = apiUrl.replace("/api", "");
    console.log("Socket URL:", socketUrl);
    return socketUrl;
};

export const connectSocket = () => {
    if (socket?.connected) return socket;

    const socketUrl = getSocketUrl();
    console.log("Connecting to socket:", socketUrl);

    socket = io(socketUrl, {
        transports: ["polling", "websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
        // Don't throw error, just log it
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// ========== TRACKING FUNCTIONS ==========

/**
 * Join a tracking room to receive location updates
 * Used by HOST to track customer's car
 */
export const joinTracking = (bookingId) => {
    if (!socket?.connected) {
        console.warn("Socket not connected, connecting now...");
        connectSocket();
    }
    socket?.emit("join_tracking", bookingId);
    console.log("Joined tracking room:", bookingId);
};

/**
 * Send location update
 * Used by CUSTOMER while driving
 */
export const sendLocation = (bookingId, coords) => {
    if (!socket?.connected) return;

    socket.emit("send_location", {
        bookingId,
        lat: coords.latitude,
        lng: coords.longitude,
        heading: coords.heading || 0,
        speed: coords.speed || 0,
    });
};

/**
 * Listen for location updates
 * Used by HOST to see car position
 */
export const onLocationUpdate = (callback) => {
    if (!socket) return;
    socket.on("receive_location", callback);
};

/**
 * Stop listening for location updates
 */
export const offLocationUpdate = () => {
    if (!socket) return;
    socket.off("receive_location");
};

export default {
    connectSocket,
    getSocket,
    disconnectSocket,
    joinTracking,
    sendLocation,
    onLocationUpdate,
    offLocationUpdate,
};
