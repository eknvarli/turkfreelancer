import React, { useState } from "react";

export default function UserLogin({ setNick }) {
    const [input, setInput] = useState("");

    const submit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const nickname = input.trim();
        setNick(nickname);
        localStorage.setItem("turkfreelancer_nick", nickname);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <img src="logo.png" className="rounded-lg" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    TürkFreelancer
                </h1>
                <p className="text-gray-400 text-sm font-medium">Yenilikçi freelancer topluluğu.</p>
            </div>

            <form onSubmit={submit} className="w-full space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block text-center">
                        Kullanıcı Adı
                    </label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="örnek: ekin"
                        maxLength={20}
                        autoFocus
                    />
                </div>
                <br />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-full py-3 bg-blue-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none"
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span>Sohbete Katıl</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </button>
                <br />
            </form>

            <div className="mt-8 w-full">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
                    <div className="text-xs text-gray-400 font-medium text-center mb-3 uppercase tracking-wider">
                        Canlı İstatistikler
                    </div>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <div className="text-green-400 font-bold text-lg">1.2K</div>
                            </div>
                            <div className="text-gray-500 text-xs">Çevrimiçi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-400 font-bold text-lg mb-1">15K</div>
                            <div className="text-gray-500 text-xs">Freelancer</div>
                        </div>
                        <div className="text-center">
                            <div className="text-purple-400 font-bold text-lg mb-1">45K</div>
                            <div className="text-gray-500 text-xs">Toplam</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <div className="text-xs text-gray-500 font-medium">
                    TürkFreelancer bir <a target="_blank" className="text-blue-500" href="https://enufak.com">EnUfak&copy;</a> yapısıdır.
                </div>
            </div>
        </div>
    );
}