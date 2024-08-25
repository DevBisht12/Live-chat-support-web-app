import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const PORT = 5000;

// Create an HTTP server
const server = http.createServer(app);

// Create a Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust CORS settings for production
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New user connected...");

  // Handle incoming messages
  socket.on("joinRoom", (data) => {
    if (data.roomName) {
      socket.join(data.roomName);
    }

    // console.log(data);
  });
  socket.on("request-from-user", ({ SupportRroom, message, roomid }) => {
    if (roomid) {
      socket.join(roomid);
    }

    console.log("Msg-->", message);
    console.log("RoomId-->", roomid);
    io.to(SupportRroom).emit("chat-request", { message, roomid, accepted: 0 });
  });

  socket.on("accept-chat-request", ({ roomid, leaveRoom }) => {
    console.log("RoomId--> after accepting the request", roomid);
    console.log(leaveRoom)

    socket.leave(leaveRoom);
    if (roomid) {
      socket.join(roomid);
      io.to(roomid).emit("chat-accepted", {
        chatAccepted: true,
        roomid: roomid,
      });
    }
  });

  socket.on("message", ({ roomid, message }) => {
    console.log("Message received in room:", roomid, "Message:", message);
    io.to(roomid).emit("message", message);
  });

  socket.on("end-chat",({roomId,joinRoom})=>{
    console.log('from end chat',roomId, joinRoom)
    socket.leave(roomId)
    io.to(roomId).emit("end-chat", "Support left the chat");
   
    socket.join(joinRoom)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
