// import React, { useEffect, useState } from "react";
// import { getSocket } from "../config/socket.config";
// import { v4 as uuidv4 } from "uuid";

// const SupportComponent = () => {
//   const [inputValue, setInputValue] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [userMsg, setUserMsg] = useState("");
//   const [roomId, setRoomId] = useState("");
//   const [requestAlert, setRequestAlert] = useState(false);

//   useEffect(() => {
//     const socketInstance = getSocket();
//     setSocket(socketInstance);

//     socketInstance.connect();
//     socketInstance.emit("joinRoom", {
//       user: "support1-->" + uuidv4(),
//       roomName: "Support-room",
//     });

//     // Listen for incoming messages
//     socketInstance.on("message", (incomingMessage) => {
//       setMessages((prevMessages) => [...prevMessages, incomingMessage]);
//     });

//     // Listen for chat requests
//     socketInstance.on("chat-request", ({ message, roomid,accepted }) => {
//       setUserMsg(message);
//       setRoomId(roomid);
//       setRequestAlert(true);
//     });

//     // Listen for chat acceptance
//     socketInstance.on("chat-accepted", ({ chatAccepted }) => {
//       if (chatAccepted) {
//         setRequestAlert(false);
//       }
//     });

//     // Listen for End Chat
//     socketInstance.on("end-chat", (message) => {
//         console.log('Chat end message:', message);
//         setMessages((prevMessages) => [...prevMessages, message]);

//       });
  

//     // Cleanup function
//     return () => {
//       socketInstance.off("message");
//       socketInstance.off("chat-request");
//       socketInstance.off("chat-accepted");
//       socketInstance.disconnect();
//     };
//   }, []);

//   console.log(roomId)
//   const acceptChatRequest = () => {
//     if (roomId) {
//       socket.emit("accept-chat-request", { roomid: roomId, leaveRoom: "Support-room" });
//     }
//   };

//   const handleSendMsg = () => {
//     if (roomId && inputValue.trim()) {
//       socket.emit("message", { roomid: roomId, message: inputValue });
//       setInputValue("");
//     }
//   };
  
//   const handleEndChat =()=>{
//     console.log(roomId)
//     socket.emit("end-chat", {roomId:roomId,joinRoom:"Support-room"})
//     console.log(messages)
//     setRoomId("")
//   } 

//   return (
//     <div>
//       {requestAlert && (
//         <div className="reqBox">
//           <h4>Room ID: {roomId}</h4>
//           <button onClick={acceptChatRequest}>Accept</button>
//         </div>
//       )}
//       <h1>Support Chat Web App</h1>
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
//       {roomId? <button onClick={handleEndChat} >End Chat</button>:null}
//     </div>
//   );
// };

// export default SupportComponent;



import React, { useContext, useEffect, useState } from "react";
import { getSocket } from "../config/socket.config";
import { v4 as uuidv4 } from "uuid";
// import { useEndChatContext, useSocket } from "../context/SocketContext";
// import end

const SupportComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userMsg, setUserMsg] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [requestAlert, setRequestAlert] = useState(false);
  const [chatReqAccepted, setChatReqAccepted] = useState(false);
  const [chatRequests, setChatRequests] = useState([]);
  const [userLeft,setUserLeft]=useState(false)
//  const {se} = useContext(useEndChatContext)

  useEffect(() => {
    if(roomId){
      const handleBeforeUnload = (event) => {
        const message = 'Are you sure you want to leave? Changes you made may not be saved.';
        event.preventDefault(); 
        event.returnValue = message; 
        return message; 
      };
  
      // Add the event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
  
      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  useEffect(() => {
    // Retrieve data from localStorage on component mount
    const storedRoomId = localStorage.getItem("RoomId");
    const storedMessages = localStorage.getItem("messages");
    const storedChatReqAccepted = localStorage.getItem("chatReqAccepted");

    if (storedRoomId) {
      setRoomId(JSON.parse(storedRoomId));
    }

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    if (storedChatReqAccepted) {
      setChatReqAccepted(JSON.parse(storedChatReqAccepted));
    }
  }, []);

  useEffect(() => {
    // Store data in localStorage whenever messages, roomId, or chatReqAccepted change
    localStorage.setItem("messages", JSON.stringify(messages));
    localStorage.setItem("RoomId", JSON.stringify(roomId));
    localStorage.setItem("chatReqAccepted", JSON.stringify(chatReqAccepted));
  }, [messages, roomId, chatReqAccepted]);

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
    socketInstance.on("chat-request", ({ chatRequests, message, roomid }) => {
      setUserMsg((preMsg) => [...preMsg, message]);
      setRequestAlert(true);
      setChatRequests(chatRequests);
    });

    // Listen for chat requests updates
    socketInstance.on("chat-requests-updated", (updatedChatRequests) => {
      setChatRequests(updatedChatRequests);
    });

    // Listen for chat acceptance
    socketInstance.on("chat-accepted", ({ chatAccepted }) => {
      if (chatAccepted) {
        setRequestAlert(false);
      }
    });

    // Listen for End Chat
    socketInstance.on("end-chat", ({ chatRequests, message,user }) => {
      console.log('from support ',message,user)
      if(user){
        setRoomId("")
        window.location.reload()
      }
      setChatRequests(chatRequests);
      setMessages((prevMessages) => [...prevMessages, message]);
      // Remove roomId and set chatReqAccepted to false
      if(user){
        localStorage.removeItem("RoomId");
      localStorage.removeItem("chatReqAccepted");
      localStorage.removeItem("messages")
      }
      setRoomId("");
      setChatReqAccepted(false);
    });

    // Cleanup function
    return () => {
      socketInstance.off("message");
      socketInstance.off("chat-request");
      socketInstance.off("chat-requests-updated");
      socketInstance.off("chat-accepted");
      socketInstance.disconnect();
    };
  }, []);
  // useEffect(()=>{
  //   if(userLeft===true){
  //     console.log('29')
  //     // if (roomId) {
  //       socket.emit("end-chat", { roomId: roomId, joinRoom: "Support-room" });
  //       setRoomId("");
  //       setChatReqAccepted(false);
  //     // }
  //   }
  // },[userLeft])
  console.log(userLeft)

  const acceptChatRequest = (roomid) => {
    setRoomId(roomid);
    if (roomid) {
      socket.emit("accept-chat-request", {
        roomid: roomid,
        leaveRoom: "Support-room",
      });
      const first_msg = userMsg.find((msg) => msg[roomid]);
      if (first_msg && first_msg[roomid]) {
        setMessages((prevMessages) => [...prevMessages, first_msg[roomid]]);
        setChatReqAccepted(true);
      }
    }
  };

  const handleSendMsg = () => {
    if (roomId && inputValue.trim()) {
      socket.emit("message", { roomid: roomId, message: inputValue });
      setInputValue("");
    }
  };

  const handleEndChat = () => {
    if (roomId) {
      socket.emit("end-chat", { roomId: roomId, joinRoom: "Support-room" });
      setRoomId("");
      setChatReqAccepted(false);
    }
  };


  return (
    <div>
      {Array.isArray(chatRequests) &&
        chatRequests.map(
          (request, i) =>
            !request.accepted && (
              <div className="reqBox" key={i}>
                <h4>Room ID: {request.roomid}</h4>
                <button onClick={() => acceptChatRequest(request.roomid)}>Accept</button>
              </div>
            )
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
        disabled={!chatReqAccepted}
      />
      <button onClick={handleSendMsg}>Send</button>
      {chatReqAccepted ? (
        <button onClick={handleEndChat}>End Chat</button>
      ) : null}
    </div>
  );
};

export default SupportComponent;





