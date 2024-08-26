// import React, { useEffect, useState } from "react";
// import { getSocket } from "../config/socket.config";
// import { v4 as uuidv4 } from "uuid";

// const UserComponent = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [roomId, setRoomId] = useState("");

//   useEffect(() => {
//     const socketInstance = getSocket();
//     setSocket(socketInstance);

//     socketInstance.connect();
//     socketInstance.emit("joinRoom", {
//       user: "User1-->" + uuidv4(),
//       roomName: "User-room",
//     });

//     // Listen for incoming messages
//     socketInstance.on("message", (incomingMessage) => {
//       setMessages((prevMessages) => [...prevMessages, incomingMessage]);
//     });

//     // Listen for chat acceptance
//     socketInstance.on("chat-accepted", ({ chatAccepted, roomid }) => {
//       if (chatAccepted) {
//         setRoomId(roomid);
//       }
//     });

//     // Listen for End Chat
//     socketInstance.on("end-chat", (message) => {
//       console.log("Chat end message:", message);
//       setMessages((prevMessages) => [...prevMessages, message]);
//       setRoomId("")
//     });

//     // Cleanup function
//     return () => {
//       socketInstance.off("message");
//       socketInstance.off("chat-accepted");
//       socketInstance.disconnect();
//     };
//   }, []);

//   const handleSendMsg = () => {
//     if (inputValue.trim()) {
//       if (!roomId) {
//         // Send chat request if roomId is not set
//         socket.emit("request-from-user", {
//           SupportRroom: "Support-room",
//           message: inputValue,
//           roomid: uuidv4(),
//         });
//       } else {
//         // Send message to the existing room
//         socket.emit("message", { roomid: roomId, message: inputValue });
//       }
//       setInputValue("");
//     }
//   };
//   console.log(roomId);
//   return (
//     <div>
//       <h1>User Chat Web App</h1>
//       {messages.map((msg, i) => (
//         <div key={i}>
//           <h4>{msg}</h4>
//         </div>
//       ))}
//       <input
//         value={inputValue}
//         onChange={(e) => setInputValue(e.target.value)}
//         type="text"
//         style={{ padding: "0.6rem" }}
//       />
//       <button onClick={handleSendMsg}>Send</button>
//     </div>
//   );
// };

// export default UserComponent;


import React, { useEffect, useState } from "react";
import { getSocket } from "../config/socket.config";
import { v4 as uuidv4 } from "uuid";

const UserComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.connect();
    socketInstance.emit("joinRoom", {
      user: "User1-->" + uuidv4(),
      roomName: "User-room",
    });

    // Listen for incoming messages
    socketInstance.on("message", (incomingMessage) => {
      setMessages((prevMessages) => [...prevMessages, incomingMessage]);
    });

    // Listen for chat acceptance
    socketInstance.on("chat-accepted", ({ chatAccepted, roomid }) => {
      if (chatAccepted) {
        setRoomId(roomid);
      }
    });

    // Listen for End Chat
    socketInstance.on("end-chat", (message) => {
      console.log("Chat end message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setRoomId("")
    });

    // Cleanup function
    return () => {
      socketInstance.off("message");
      socketInstance.off("chat-accepted");
      socketInstance.disconnect();
    };
  }, []);

  const handleSendMsg = () => {
    if (inputValue.trim()) {
      if (!roomId) {
        // Send chat request if roomId is not set
        socket.emit("request-from-user", {
          SupportRroom: "Support-room",
          message: inputValue,
          roomid: uuidv4(),
        });
        setMessages((prevMessages)=>[...prevMessages,inputValue])
      } else {
        // Send message to the existing room
        socket.emit("message", { roomid: roomId, message: inputValue });
      }
      setInputValue("");
    }
  };
  console.log(roomId);
  return (
    <div>
      <h1>User Chat Web App</h1>
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
    </div>
  );
};

export default UserComponent;
