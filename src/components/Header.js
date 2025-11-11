import React from 'react';

const Header = ({ nick, onLogout, isOnline, userData, isGoogleUser, connectionStatus }) => {
    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'bg-green-400';
            case 'connecting': return 'bg-yellow-400 animate-pulse';
            case 'error': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Çevrimiçi';
            case 'connecting': return 'Bağlanıyor...';
            case 'error': return 'Bağlantı Hatası';
            default: return 'Çevrimdışı';
        }
    };

    return (
        <div className="px-4 py-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
                    <span className="text-xs text-gray-300">{getStatusText()}</span>
                </div>
                <div className="text-xs text-gray-400">•</div>
                <div className="text-sm font-medium text-gray-200">TurkFreelancer</div>
            </div>

            <div className="flex items-center space-x-3">
                <div className="text-right">
                    <div className="text-xs text-gray-300">{nick}</div>
                    <div className="text-xs text-gray-500">
                        {isGoogleUser ? 'Google' : 'Anonim'}
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                    title="Çıkış Yap"
                >
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Header;