import React, { useEffect, useState } from "react";

export default function UserLogin({ setNick, onGoogleLogin, onAnonymousLogin }) {
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get("name");
        const email = params.get("email");

        if (name) {
            console.log("Web login detected:", name);

            if (window.history && window.history.replaceState) {
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
                console.log("URL cleaned, removed query parameters");
            }

            const userData = {
                name: name,
                email: email || "",
                picture: ""
            };

            if (onGoogleLogin) {
                onGoogleLogin(userData);
            }
        }

        const handleMessage = (e) => {
            console.log("Received message from popup:", e.data);
            if (e.data && e.data.name) {
                setIsLoading(false);
                if (onGoogleLogin) {
                    onGoogleLogin(e.data);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [setNick, onGoogleLogin]);

    const loginWithGoogle = () => {
        setIsLoading(true);
        const isExtension = window.location.protocol === "chrome-extension:";

        console.log("Google login started, extension:", isExtension);

        if (isExtension) {
            const authWindow = window.open(
                "http://localhost:4000/auth/google?extension=1",
                "googleAuth",
                "width=500,height=600,left=100,top=100"
            );

            if (!authWindow) {
                console.error("Popup blocked! Please allow popups for this site.");
                setIsLoading(false);
                return;
            }

            const checkPopup = setInterval(() => {
                if (authWindow && authWindow.closed) {
                    setIsLoading(false);
                    clearInterval(checkPopup);
                    console.log("Google auth popup closed");
                }
            }, 500);
        } else {
            window.location.href = 'http://localhost:4000/auth/google';
        }
    };

    const handleAnonymousLogin = () => {
        if (input.trim()) {
            console.log("Anonymous login with custom name:", input.trim());
            if (onAnonymousLogin) {
                onAnonymousLogin(input.trim());
            }
        } else {
            const anonymousName = `Anonim_${Math.random().toString(36).substr(2, 6)}`;
            console.log("Anonymous login with random name:", anonymousName);
            if (onAnonymousLogin) {
                onAnonymousLogin(anonymousName);
            }
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        handleAnonymousLogin();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <img src="logo.png" className="rounded-lg" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    TurkFreelancer
                </h1>
                <p className="text-gray-400 text-sm font-medium">Yenilikçi freelancer topluluğu</p>
            </div>

            <div className="w-full space-y-4">
                <button
                    onClick={loginWithGoogle}
                    disabled={isLoading}
                    className="w-full py-3 bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-300 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg flex items-center justify-center space-x-3"
                >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                            <span>Giriş Yapılıyor...</span>
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Google ile Giriş Yap</span>
                        </>
                    )}
                </button>

                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative bg-gray-900 px-3 text-sm text-gray-400">veya</div>
                </div>

                <form onSubmit={submitForm} className="space-y-3">
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-blue-500/25"
                    >
                        Anonim Olarak Devam Et
                    </button>
                </form>
            </div>
            <div className="mt-6 text-center">
                <div className="text-xs text-gray-500 font-medium">
                    TürkFreelancer bir <a className="text-blue-500" href="https://enufak.com" target="_blank">EnUfak&copy;</a> oluşumudur.
                </div>
                <div className="text-xs text-gray-600 mt-1">
                    {isLoading && "Google giriş penceresi açılıyor..."}
                </div>
                {window.location.protocol === "chrome-extension:" && (
                    <div className="text-xs text-yellow-500 mt-1">
                        Popup'ların engellenmediğinden emin olun
                    </div>
                )}
            </div>
        </div>
    );
}