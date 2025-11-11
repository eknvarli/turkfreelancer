import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import UserLogin from "./components/UserLogin";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import Header from "./components/Header";

const socket = io("http://localhost:4000");

export default function App() {
  const savedNick = localStorage.getItem("turkfreelancer_nick");
  const [nick, setNick] = useState(savedNick || "");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  const addMessage = (text) => {
    if (!text.trim()) return;

    socket.emit("send_message", { text });
  };

  const handleLogout = () => {
    setNick("");
    setMessages([]);
    localStorage.removeItem("turkfreelancer_nick");
  };

  useEffect(() => {
    if (!nick) return;

    socket.connect();

    socket.on("connect", () => setIsOnline(true));
    socket.on("disconnect", () => setIsOnline(false));

    socket.emit("join_chat", nick);

    socket.on("previous_messages", (oldMsgs) => {
      setMessages((prev) => [...prev, ...oldMsgs]);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("previous_messages");
      socket.off("receive_message");
    };
  }, [nick]);

  return (
    <div className="w-[500px] h-[600px] bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
      {!nick ? (
        <UserLogin setNick={setNick} />
      ) : (
        <>
          <Header nick={nick} onLogout={handleLogout} isOnline={isOnline} />
          <div className="flex-1 flex flex-col min-h-0">
            <ChatWindow messages={messages} nick={nick} />
            <MessageInput onSend={addMessage} />
          </div>
        </>
      )}
    </div>
  );
}
