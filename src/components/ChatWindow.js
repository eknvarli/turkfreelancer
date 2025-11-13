import React, { useEffect, useRef, useState } from 'react';

const ChatWindow = ({ messages, nick }) => {
    const messagesEndRef = useRef(null);
    const [cooldownAlerts, setCooldownAlerts] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, cooldownAlerts]);

    useEffect(() => {
        const handleMessageCooldown = (event) => {
            if (event.detail && event.detail.message) {
                const alertId = Date.now();
                const newAlert = {
                    id: alertId,
                    text: event.detail.message,
                    type: 'cooldown'
                };

                setCooldownAlerts(prev => [...prev, newAlert]);

                setTimeout(() => {
                    setCooldownAlerts(prev => prev.filter(alert => alert.id !== alertId));
                }, 5000);
            }
        };

        window.addEventListener('cooldownAlert', handleMessageCooldown);

        return () => {
            window.removeEventListener('cooldownAlert', handleMessageCooldown);
        };
    }, []);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const showCooldownAlert = (message) => {
        const event = new CustomEvent('cooldownAlert', {
            detail: { message }
        });
        window.dispatchEvent(event);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-900 to-gray-800">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex ${message.user === nick ? 'justify-end' : 'justify-start'} ${
                        message.isSystem ? 'justify-center' : ''
                    }`}
                >
                    {message.isSystem ? (
                        <div className="bg-gray-700 px-3 py-1 rounded-full">
                            <span className="text-xs text-gray-300">{message.text}</span>
                        </div>
                    ) : (
                        <div
                            className={`max-w-[80%] rounded-2xl p-3 ${
                                message.user === nick
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 rounded-br-none'
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
                                className={`text-xs mt-1 ${
                                    message.user === nick ? 'text-blue-200' : 'text-gray-400'
                                }`}
                            >
                                {formatTime(message.timestamp)}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {cooldownAlerts.map((alert) => (
                <div key={alert.id} className="flex justify-center">
                    <div className="bg-yellow-900 border border-yellow-700 px-4 py-2 rounded-full">
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-xs text-yellow-300">{alert.text}</span>
                        </div>
                    </div>
                </div>
            ))}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;