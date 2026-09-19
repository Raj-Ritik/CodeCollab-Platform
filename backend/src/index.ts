import dotenv from "dotenv";
dotenv.config();
import http from "http";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import router from "./router/index.js";
import cors from "cors";

const PORT = Number(process.env.PORT) || 3000;
const IP_ADDRESS = process.env.IP_ADDRESS || "0.0.0.0";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export interface UserInfo {
  id?: string;
  name: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  roomId: string;
  [key: string]: unknown;
}

interface ClientToServerEvents {
  joinProjectRoom: (payload: { roomid: string; userInfo: UserInfo }) => void;
  leaveProjectRoom: (roomId: string) => void;
  privateMessage: (payload: {
    roomid: string;
    data: string;
    languageCode: unknown;
  }) => void;
  sendChatMessage: (messageData: ChatMessage) => void;
  privateRoomJoin: (data: string) => void;
  message: (data: unknown) => void;
  error: (error: unknown) => void;
}

interface ServerToClientEvents {
  projectUsers: (payload: {
    roomId: string;
    count: number;
    users: UserInfo[];
  }) => void;
  userLeft: (payload: { userId?: string; roomId: string }) => void;
  privateMessage: (data: string, languageCode: unknown) => void;
  chatMessage: (messageData: ChatMessage) => void;
  error: (message: string) => void;
}

interface SocketData {
  userInfo: UserInfo | null;
  currentRoom: string | null;
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Backend Connected",
  });
});

app.use("/", router); // Use the router

/** Collect the userInfo of every socket currently in a room. */
function roomUsersOf(roomId: string): UserInfo[] {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || [])
    .map((socketId) => io.sockets.sockets.get(socketId)?.data.userInfo)
    .filter((info): info is UserInfo => Boolean(info));
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining project room
  socket.on("joinProjectRoom", ({ roomid, userInfo }) => {
    if (!userInfo || !userInfo.name) {
      console.error("Invalid userInfo provided");
      socket.emit("error", "Invalid user information");
      return;
    }

    // Leave any existing rooms
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    // Join new room
    socket.join(roomid);
    socket.data.userInfo = userInfo;
    socket.data.currentRoom = roomid;

    // Get current users in room
    const roomUsers = roomUsersOf(roomid);

    // Emit updated user list to all clients in room
    io.to(roomid).emit("projectUsers", {
      roomId: roomid,
      count: roomUsers.length,
      users: roomUsers,
    });

    console.log(`User ${userInfo.name} joined room ${roomid}`);
  });

  // Handle leaving project room
  socket.on("leaveProjectRoom", (roomId) => {
    socket.leave(roomId);
    socket.data.currentRoom = null;
    console.log(`User ${socket.data.userInfo?.name} left room ${roomId}`);
  });

  // Handle code updates
  socket.on("privateMessage", ({ roomid, data, languageCode }) => {
    if (socket.data.currentRoom === roomid) {
      socket.to(roomid).emit("privateMessage", data, languageCode);
    }
  });

  // Handle chat messages
  socket.on("sendChatMessage", (messageData) => {
    if (socket.data.currentRoom === messageData.roomId) {
      io.to(messageData.roomId).emit("chatMessage", messageData);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const roomId = socket.data.currentRoom;
    const userInfo = socket.data.userInfo;

    if (roomId && userInfo) {
      // Get remaining users in room
      const roomUsers = roomUsersOf(roomId);

      // Notify room about user leaving first
      io.to(roomId).emit("userLeft", {
        userId: userInfo.id,
        roomId: roomId,
      });

      // Then emit updated user list to remaining clients
      io.to(roomId).emit("projectUsers", {
        roomId: roomId,
        count: roomUsers.length,
        users: roomUsers,
      });

      // Clean up socket data
      socket.data.currentRoom = null;
      socket.data.userInfo = null;
    }

    console.log("User disconnected:", socket.id);
  });

  socket.on("privateRoomJoin", (data) => {
    try {
      socket.join(data);
      console.log(data + " joined private room");
    } catch (error) {
      console.error("Error in privateRoomJoin:", error);
      socket.emit("error", "Failed to join private room");
    }
  });

  socket.on("message", (data) => {
    console.log(data);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

httpServer.listen(PORT, IP_ADDRESS, () => {
  console.log(`Backend connected on port ${PORT} ${IP_ADDRESS}`);
});
