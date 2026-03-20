import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

// We create a new socket connection right away or export a factory.
// Since each LiveColumn might join a different room, returning a new socket instance
// prevents multiplexing issues if the backend emits events without room identifiers.
export const createLiveSocket = (): Socket => {
  return io(SOCKET_URL, {
    transports: ["websocket"], // force websocket to avoid Render polling/CORS issues
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};
