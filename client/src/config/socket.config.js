import { io } from "socket.io-client";


let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000/", { autoConnect: false });
  }
  return socket;
};
