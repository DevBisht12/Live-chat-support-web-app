import express from "express";
import { Server } from "socket.io";
import http from "http";
// import { connectKafkaProducer } from "./config/kafka.config.js";
// import { produceChatRequest,consumeChatRequests } from "./config/kafka.config.js";

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
let chatRequests = [];

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New user connected...",socket.id);

  // Handle incoming messages
  socket.on("joinRoom", (data) => {
    if (data.roomName) {
      socket.join(data.roomName);
    }

    // console.log(data);
  });

  socket.on("request-from-user", async ({ SupportRroom, roomid, message }) => {
    if (roomid) {
      socket.join(roomid);
    }

    console.log("Msg-->", message);
    console.log("RoomId-->", roomid);

    // Check if there are any agents in the support room
    const roomSize = io.sockets.adapter.rooms.get(SupportRroom)?.size || 0;

    console.log(roomSize);
    if (roomSize > 0) {
      // There are agents available, proceed with the request
      chatRequests.push({ roomid, accepted: false, active: false });

      const filterRequest = chatRequests.find((req) => req.roomid === roomid);
      if (filterRequest !== roomid) {
        io.to(SupportRroom).emit("chat-request", {
          chatRequests,
          message,
          roomid,
        });
      }

      console.log( 'from 59',chatRequests)
      try {
        // Uncomment and adjust this line if Kafka is used
        // await produceChatRequest("chat_requests", chatRequests);
      } catch (error) {
        console.log("Error producing chat request to Kafka", error);
      }
    } else {
      // No agents available, notify the user
      socket.emit("chat-request-failed", {
        message:
          "All support agents are busy right now. Please try again later.",
      });
    }
  });
  socket.on("accept-chat-request", ({ roomid, leaveRoom }) => {
    console.log("RoomId--> after accepting the request", roomid);
    console.log(leaveRoom);

    // Update the chatRequests array
    const chatRequestIndex = chatRequests.findIndex(
      (request) => request.roomid === roomid
    );
    if (chatRequestIndex !== -1) {
      chatRequests[chatRequestIndex].accepted = true;
      chatRequests[chatRequestIndex].active= true
    }

    console.log("chat request 53", chatRequests);

    io.emit("chat-requests-updated", chatRequests);

    // Leave the current room
    socket.leave(leaveRoom);

    if (roomid) {
      socket.join(roomid);
      // Emit the updated chat requests
      io.to(roomid).emit("chat-accepted", {
        chatAccepted: true,
        roomid: roomid,
        updatedChatRequest: chatRequests,
      });
    }
  });

  socket.on("message", ({ roomid, message }) => {
    console.log("Message received in room:", roomid, "Message:", message);
    io.to(roomid).emit("message", message);
  });

  socket.on("end-chat", ({ roomId, joinRoom ,user }) => {
    console.log("from end chat", roomId, joinRoom);

    const chatRequestIndex = chatRequests.findIndex(
      (request) => request.roomid === roomId
    );
    if (chatRequestIndex !== -1) {
      chatRequests[chatRequestIndex].active= false
    }
    console.log("chat request 118", chatRequests);
    socket.leave(roomId);
    io.to(roomId).emit("end-chat", {chatRequests,message:"Chat has ended...",user});

    socket.join(joinRoom);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// connectKafkaProducer().catch((err) =>
//   console.log("Failed to connect to kafka...", err)
// );

// consumeChatRequests("chat_requests").catch((err) =>
//   console.log("Failed to consume data from kafka...", err)
// );

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});