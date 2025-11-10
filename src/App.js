import React, { useState, useEffect, useRef } from 'react';
import UserLogin from './components/UserLogin';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Header from './components/Header';

export default function App() {
  const savedNick = localStorage.getItem("turkfreelancer_nick");

  const [nick, setNick] = useState(savedNick || "");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(true);

  const addMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      user: nick,
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isOwn: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    if (nick) {
      const mockMessages = [
        {
          id: 1,
          user: "System",
          text: `${nick} sohbete katıldı!`,
          timestamp: "10:00",
          isSystem: true
        },
        {
          id: 2,
          user: "Ahmet",
          text: "Selamlar! Yeni proje var mı?",
          timestamp: "10:01",
          isOwn: false
        },
        {
          id: 3,
          user: "Ayşe",
          text: "Frontend developer arıyorum React ile",
          timestamp: "10:02",
          isOwn: false
        }
      ];
      setMessages(mockMessages);
    }
  }, [nick]);

  const handleLogout = () => {
    setNick("");
    setMessages([]);
    localStorage.removeItem('turkfreelancer_nick');
  };

  return (
    <div className="w-[500px] h-[600px] bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl border border-gray-700 overflow-hidden flex flex-col">
      {!nick ? (
        <UserLogin setNick={setNick} />
      ) : (
        <>
          <Header 
            nick={nick} 
            onLogout={handleLogout}
            isOnline={isOnline}
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