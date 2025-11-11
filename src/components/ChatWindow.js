import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ messages, nick }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-900 to-gray-800">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.user === nick ? 'justify-end' : 'justify-start'} ${message.isSystem ? 'justify-center' : ''
            }`}
        >
          {message.isSystem ? (
            <div className="bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-xs text-gray-300">{message.text}</span>
            </div>
          ) : (
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${message.user === nick
                  ? 'bg-blue-600 rounded-br-none'
                  : 'bg-gray-700 rounded-bl-none'
                }`}
            >
              {message.user !== nick && (
                <div className="text-xs font-medium text-blue-300 mb-1">
                  {message.user}
                </div>
              )}
              <div className="text-white text-sm">{message.text}</div>
              <div
                className={`text-xs mt-1 ${message.user === nick ? 'text-blue-200' : 'text-gray-400'
                  }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;