import React, { useEffect, useState } from "react";
import { getSocket } from "../config/socket.config";
import { v4 as uuidv4 } from "uuid";

const SupportComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const [roomId, setRoomId] = useState("");
  const [requestAlert, setRequestAlert] = useState(false);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.connect();
    socketInstance.emit("joinRoom", {
      user: "support1-->" + uuidv4(),
      roomName: "Support-room",
    });

    // Listen for incoming messages
    socketInstance.on("message", (incomingMessage) => {
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    // Listen for chat requests
    socketInstance.on("chat-request", ({ message, roomid,accepted }) => {
      setUserMsg(message);
      setRoomId(roomid);
      setRequestAlert(true);
    });

    // Listen for chat acceptance
    socketInstance.on("chat-accepted", ({ chatAccepted }) => {
      if (chatAccepted) {
        setRequestAlert(false);
      }
    });

    // Listen for End Chat
    socketInstance.on("end-chat", (message) => {
        console.log('Chat end message:', message);
        setMessages((prevMessages) => [...prevMessages, message]);

      });
  

    // Cleanup function
    return () => {
      socketInstance.off("message");
      socketInstance.off("chat-request");
      socketInstance.off("chat-accepted");
      socketInstance.disconnect();
    };
  }, []);

  console.log(roomId)
  const acceptChatRequest = () => {
    if (roomId) {
      socket.emit("accept-chat-request", { roomid: roomId, leaveRoom: "Support-room" });
    }
  };

  const handleSendMsg = () => {
    if (roomId && inputValue.trim()) {
      socket.emit("message", { roomid: roomId, message: inputValue });
      setInputValue("");
    }
  };
  
  const handleEndChat =()=>{
    console.log(roomId)
    socket.emit("end-chat", {roomId:roomId,joinRoom:"Support-room"})
    console.log(messages)
    setRoomId("")
  } 

  return (
    <div>
      {requestAlert && (
        <div className="reqBox">
          <h4>Room ID: {roomId}</h4>
          <button onClick={acceptChatRequest}>Accept</button>
        </div>
      )}
      <h1>Support Chat Web App</h1>
      {messages.map((msg, i) => (
        <div key={i}>
          <h4>{msg}</h4>
        </div>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        type="text"
        style={{ padding: "0.6rem" }}
      />
      <button onClick={handleSendMsg}>Send</button>
      {roomId? <button onClick={handleEndChat} >End Chat</button>:null}
    </div>
  );
};

export default SupportComponent;
