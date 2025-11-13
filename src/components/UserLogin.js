import React, { useState } from "react";

export default function UserLogin({ setNick }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [anonymousName, setAnonymousName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_URL = "http://localhost:4000/auth";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLoginMode ? "/login" : "/register";

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Bir hata oluştu.");

            const username = data.user?.name || data.username || email.split("@")[0];

            localStorage.setItem("turkfreelancer_nick", username);
            setNick(username);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnonymousLogin = async () => {
        const nick = anonymousName.trim() || `Anonim_${Math.random().toString(36).substr(2, 6)}`;
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/anonymous`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nick }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("turkfreelancer_nick", data.user?.nick || nick);
                setNick(data.user?.nick || nick);
            } else {
                console.log("Backend anonymous endpoint not available, using local storage");
                localStorage.setItem("turkfreelancer_nick", nick);
                setNick(nick);
            }
        } catch (err) {
            console.log("Anonymous login error, using local storage:", err.message);
            localStorage.setItem("turkfreelancer_nick", nick);
            setNick(nick);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <img className={"rounded-lg"} src={"logo.png"} />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    TürkFreelancer
                </h1>
                <p className="text-gray-400 text-sm font-medium">Yenilikçi freelancer topluluğu.</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-800/50 p-6 rounded-2xl shadow-lg space-y-4 border border-gray-700">
                <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />
                <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                />

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                >
                    {loading ? "İşlem yapılıyor..." : isLoginMode ? "Giriş Yap" : "Kayıt Ol"}
                </button>

                <div className="text-center text-sm mt-2 text-gray-400">
                    {isLoginMode ? (
                        <span>
                            Hesabın yok mu?{" "}
                            <button
                                type="button"
                                onClick={() => setIsLoginMode(false)}
                                className="text-blue-400 hover:underline"
                            >
                                Kayıt Ol
                            </button>
                        </span>
                    ) : (
                        <span>
                            Zaten hesabın var mı?{" "}
                            <button
                                type="button"
                                onClick={() => setIsLoginMode(true)}
                                className="text-blue-400 hover:underline"
                            >
                                Giriş Yap
                            </button>
                        </span>
                    )}
                </div>
                <button
                    onClick={handleAnonymousLogin}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg"
                >
                    {loading ? "Giriş yapılıyor..." : "Anonim Olarak Devam Et"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <div className="text-xs text-gray-500 font-medium">
                    TürkFreelancer bir <a className="text-blue-500" href="https://enufak.com" target="_blank">EnUfak&copy;</a> oluşumudur.
                </div>
            </div>
        </div>
    );
}