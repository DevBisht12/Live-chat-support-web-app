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
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages


  useEffect(() => {
    
    if(roomId){
      const handleBeforeUnload = (event) => {
        // Custom message is not supported in most browsers
        const message = 'Are you sure you want to leave? Changes you made may not be saved.';
        event.preventDefault(); // Required for older browsers
        event.returnValue = message; // Standard for modern browsers
        return message; // For some older browsers
      };
  
      // Add the event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [])

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
    socketInstance.on("end-chat", ({message,chatRequests}) => {
      console.log("Chat end message:", message);
      console.log("form 37",chatRequests)
      setMessages((prevMessages) => [...prevMessages, message]);
      setRoomId("");
    });

    // Listen for chat request failure
    socketInstance.on("chat-request-failed", ({ message }) => {
      setErrorMessage(message);
    });

    // Cleanup function
    return () => {
      socketInstance.off("message");
      socketInstance.off("chat-accepted");
      socketInstance.off("end-chat");
      socketInstance.off("chat-request-failed");
      socketInstance.disconnect();
    };
  }, []);

  const handleSendMsg = () => {

    if (inputValue.trim()) {
      let roomid;
      if (!roomId) {
        roomid=uuidv4()
        // Send chat request if roomId is not set
        socket.emit("request-from-user", {
          SupportRroom: "Support-room",
          roomid: roomid,
          // message:inputValue
          message: {[roomid]:inputValue},
        });
        setMessages((prevMessages) => [...prevMessages, inputValue]);
        localStorage.setItem(`message_${roomId}`,messages)
      } else {
        // Send message to the existing room
        socket.emit("message", { roomid: roomId, message: inputValue });
      }
      setInputValue("");
      setErrorMessage(""); // Clear error message when sending a new message
    }
  };
    const handleEndChat = () => {
    console.log(roomId)
    if (roomId) {
      socket.emit("end-chat", { roomId: roomId,joinRoom:"Support-room" ,user:true});
      console.log('end chat happed')
      setRoomId(""); 
    }
  };
console.log(roomId)
  return (
    <div>
      <h1>User Chat Web App</h1>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>} {/* Display error message */}
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
      <button onClick={handleEndChat} >End Chat</button>
    </div>
  );
};

export default UserComponent;

