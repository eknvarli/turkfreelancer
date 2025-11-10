import React from "react";

export default function MessageBubble({ message, nick }) {
    const isMine = message.user === nick;
    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${isMine
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 dark:bg-gray-800 dark:text-gray-100 rounded-bl-none"
                    }`}
            >
                <strong>{message.user}: </strong>
                {message.text}
            </div>
        </div>
    );
}
