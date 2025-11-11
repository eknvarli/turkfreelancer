import { io } from "socket.io-client";

export const socket = io("http://localhost:4000");

export const sendMessage = (msgObj) => {
    socket.emit("send_message", msgObj);
};

export const listenMessages = (callback) => {
    socket.on("receive_message", callback);
};

export const listenPreviousMessages = (callback) => {
    socket.on("previous_messages", callback);
};
