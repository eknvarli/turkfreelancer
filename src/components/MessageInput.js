import React, { useState, useEffect } from 'react';

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        let interval;
        if (cooldown > 0) {
            interval = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [cooldown]);

    useEffect(() => {
        const handleCooldownAlert = (event) => {
            if (event.detail && event.detail.message) {
                const timeMatch = event.detail.message.match(/(\d+) saniye/);
                if (timeMatch) {
                    setCooldown(parseInt(timeMatch[1]));
                }
            }
        };

        window.addEventListener('cooldownAlert', handleCooldownAlert);
        return () => window.removeEventListener('cooldownAlert', handleCooldownAlert);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && cooldown === 0 && !isSending) {
            setIsSending(true);
            onSend(message.trim());
            setMessage('');
            setIsSending(false);
        }
    };

    return (
        <div className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={cooldown > 0 ? `Lütfen bekleyin... (${cooldown}s)` : "Mesajınızı yazın..."}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                    maxLength={500}
                    disabled={cooldown > 0 || isSending}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || cooldown > 0 || isSending}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                    {isSending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default MessageInput;