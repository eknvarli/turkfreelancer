import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import UserLogin from "./components/UserLogin";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import Header from "./components/Header";

const SOCKET_URL = "http://localhost:4000";
const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  withCredentials: true
});

export default function App() {
  const savedNick = localStorage.getItem("turkfreelancer_nick");
  const [nick, setNick] = useState(savedNick || "");
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const addMessage = (text) => {
    if (!text.trim()) return;

    if (!socket.connected) {
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    }

    socket.emit("send_message", { text });
  };

  const handleLogout = async () => {
    try {
      console.log("Logout started for:", nick);

      if (socket.connected) {
        socket.emit("user_logout", nick);
      }

      if (isGoogleUser) {
        console.log("Google user logout attempting...");
        const response = await fetch("http://localhost:4000/auth/logout", {
          method: "GET",
          credentials: "include",
          headers: {
            'Accept': 'application/json',
          },
        });

        const result = await response.json();
        console.log("Backend logout response:", result);
      }

    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      if (socket.connected) {
        socket.disconnect();
      }

      setNick("");
      setUserData(null);
      setMessages([]);
      setIsOnline(false);
      setIsGoogleUser(false);
      setConnectionStatus("disconnected");
      localStorage.removeItem("turkfreelancer_nick");

      console.log("Frontend logout completed");
    }
  };

  const handleGoogleLogin = (user) => {
    console.log("Google login completed:", user.name);
    setUserData(user);
    setNick(user.name);
    setIsGoogleUser(true);
    localStorage.setItem("turkfreelancer_nick", user.name);
  };

  const handleAnonymousLogin = (anonymousName) => {
    console.log("Anonymous login:", anonymousName);
    setUserData({ name: anonymousName });
    setNick(anonymousName);
    setIsGoogleUser(false);
    localStorage.setItem("turkfreelancer_nick", anonymousName);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!savedNick) return;

      try {
        console.log("Checking auth status for:", savedNick);
        const response = await fetch("http://localhost:4000/auth/check", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Auth check response:", data);

          if (data.authenticated && data.user) {
            handleGoogleLogin({
              name: data.user.displayName,
              email: data.user.emails[0].value,
              picture: data.user.photos?.[0]?.value
            });
          } else {
            handleAnonymousLogin(savedNick);
          }
        } else {
          handleAnonymousLogin(savedNick);
        }
      } catch (err) {
        console.error("Auth check failed, assuming anonymous:", err);
        handleAnonymousLogin(savedNick);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!nick) return;

    console.log("🔄 Socket bağlantısı kuruluyor için:", nick);
    setConnectionStatus("connecting");

    const handleConnect = () => {
      console.log("✅ Socket connected successfully");
      setIsOnline(true);
      setConnectionStatus("connected");

      setTimeout(() => {
        socket.emit("join_chat", nick);
        console.log("📨 join_chat event gönderildi:", nick);
      }, 100);
    };

    const handleDisconnect = (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsOnline(false);
      setConnectionStatus("disconnected");
    };

    const handleConnectError = (error) => {
      console.error("💥 Socket connection error:", error);
      setConnectionStatus("error");
    };

    const handlePreviousMessages = (oldMsgs) => {
      console.log("📨 Previous messages received:", oldMsgs?.length || 0);
      if (oldMsgs && Array.isArray(oldMsgs)) {
        setMessages(oldMsgs);
      } else {
        console.warn("Invalid previous messages format:", oldMsgs);
        setMessages([]);
      }
    };

    const handleReceiveMessage = (msg) => {
      console.log("📩 New message received:", msg);
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) {
          console.log("Message already exists, skipping:", msg.id);
          return prev;
        }
        return [...prev, msg];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("previous_messages", handlePreviousMessages);
    socket.on("receive_message", handleReceiveMessage);

    if (!socket.connected) {
      console.log("🔌 Attempting to connect socket...");
      socket.connect();
    } else {
      console.log("🔌 Socket already connected, joining chat...");
      socket.emit("join_chat", nick);
    }

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("previous_messages", handlePreviousMessages);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [nick]);

  useEffect(() => {
    console.log("🔗 Connection status:", connectionStatus, "Online:", isOnline);
  }, [connectionStatus, isOnline]);

  useEffect(() => {
    console.log("💬 Messages updated, count:", messages.length);
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.toString() && window.history && window.history.replaceState) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log("URL cleaned on app load");
    }
  }, []);

  return (
    <div className="w-[500px] h-[600px] bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
      {!nick ? (
        <UserLogin
          setNick={setNick}
          onGoogleLogin={handleGoogleLogin}
          onAnonymousLogin={handleAnonymousLogin}
        />
      ) : (
        <>
          <Header
            nick={nick}
            onLogout={handleLogout}
            isOnline={isOnline}
            userData={userData}
            isGoogleUser={isGoogleUser}
            connectionStatus={connectionStatus}
          />
          <div className="flex-1 flex flex-col min-h-0">
            <ChatWindow messages={messages} nick={nick} />
            <MessageInput onSend={addMessage} />
          </div>
        </>
      )}
    </div>
  );
}