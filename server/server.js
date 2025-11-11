import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { connectDB, sequelize } from "./db.js";
import { Message } from "./models/Message.js";

dotenv.config();
await connectDB();
await sequelize.sync({ alter: true });

const app = express();

// CORS ayarlarını güncelle
app.use(cors({
    origin: ["http://localhost:3000", "chrome-extension://*"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session ayarlarını güncelle
app.use(session({
    secret: process.env.SESSION_SECRET || "turkfreelancer-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false, // Development'ta false
        httpOnly: false, // Chrome extension için false
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const users = {}; // socket.id → user
const userSessions = {}; // nick → socket.id

// --- Passport Google OAuth ---
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.displayName);
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    console.log("Deserializing user:", obj.displayName);
    done(null, obj);
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:4000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            console.log("Google OAuth success:", profile.displayName);
            done(null, profile);
        }
    )
);

app.get("/auth/google", (req, res, next) => {
    const extension = req.query.extension ? 1 : 0;
    req.session.extension = extension;
    console.log("Google auth started, extension:", extension);
    next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/failure",
        failureMessage: true
    }),
    (req, res) => {
        const user = req.user;
        console.log("Google callback success:", user.displayName);

        if (req.session.extension) {
            // Chrome Extension popup - mesaj gönder ve kapat
            res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TurkFreelancer - Giriş Başarılı</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container { 
                    text-align: center; 
                    padding: 20px;
                }
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">✅</div>
                <h2>Giriş Başarılı!</h2>
                <p>Sayfa kapatılıyor...</p>
            </div>
            <script>
                // Sayfa yüklendikten hemen sonra mesaj gönder
                window.onload = function() {
                    const data = { 
                        name: "${user.displayName}", 
                        email: "${user.emails[0].value}",
                        picture: "${user.photos?.[0]?.value || ''}"
                    };
                    console.log('Sending data to extension:', data);
                    
                    // Ana pencereye mesaj gönder
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(data, "*");
                        console.log('Message sent successfully');
                    } else {
                        console.error('Parent window not available');
                    }
                    
                    // 1 saniye sonra pencereyi kapat
                    setTimeout(() => {
                        window.close();
                    }, 1000);
                };
                
                // Pencere kapatılmaya çalışıldığında
                window.addEventListener('beforeunload', function() {
                    console.log('Window closing...');
                });
            </script>
        </body>
        </html>
      `);
        } else {
            // Web test - URL'de query parametreleri ile yönlendir
            // Bu durumda UserLogin component'i URL'yi temizleyecek
            res.redirect(`http://localhost:3000/?name=${encodeURIComponent(user.displayName)}&email=${encodeURIComponent(user.emails[0].value)}`);
        }
    }
);
// Kullanıcı çıkış endpoint'i - GÜNCELLENDİ
app.get("/auth/logout", (req, res) => {
    console.log("Logout request received, user:", req.user?.displayName);

    // Önce socket session'larını temizle
    if (req.user) {
        const userName = req.user.displayName;
        if (userName && userSessions[userName]) {
            const socketId = userSessions[userName];
            if (users[socketId]) {
                delete users[socketId];
            }
            delete userSessions[userName];
            console.log("Cleaned socket sessions for:", userName);
        }
    }

    // Passport logout
    req.logout((err) => {
        if (err) {
            console.error("Passport logout error:", err);
            return res.status(500).json({ success: false, error: "Logout failed" });
        }

        // Session destroy
        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.status(500).json({ success: false, error: "Session destroy failed" });
            }

            // Cookie temizle
            res.clearCookie("connect.sid");
            console.log("Logout successful");
            res.json({ success: true, message: "Logged out successfully" });
        });
    });
});

// Kullanıcı durumunu kontrol et
app.get("/auth/check", (req, res) => {
    console.log("Auth check, authenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true,
            user: req.user
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.get("/auth/failure", (req, res) => {
    console.log("OAuth failure");
    res.send("OAuth Failed");
});

// Tüm route'lar için CORS header'ları ekle
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// --- Socket.IO chat ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Yeni kullanıcı bağlandı:", socket.id);

    socket.on("join_chat", async (nick) => {
        console.log("Kullanıcı katılıyor:", nick);

        const userName = typeof nick === 'string' ? nick : nick.name || 'Anonim';

        users[socket.id] = userName;
        userSessions[userName] = socket.id;

        const lastMessages = await Message.findAll({
            order: [["id", "ASC"]],
            limit: 50,
        });

        socket.emit("previous_messages", lastMessages);

        io.emit("receive_message", {
            id: `sys-${Date.now()}`,
            text: `${userName} sohbete katıldı!`,
            isSystem: true,
            timestamp: new Date(),
        });
    });

    socket.on("send_message", async (msg) => {
        const userName = users[socket.id];
        if (!userName) return;

        const saved = await Message.create({
            user: userName,
            text: msg.text,
            timestamp: new Date(),
        });

        io.emit("receive_message", {
            id: saved.id,
            user: saved.user,
            text: saved.text,
            timestamp: saved.timestamp,
            isOwn: false
        });
    });

    socket.on("user_logout", (nick) => {
        const userName = typeof nick === 'string' ? nick : nick.name || users[socket.id];
        console.log("Socket user_logout:", userName);

        if (userName && userSessions[userName]) {
            delete userSessions[userName];
        }
        if (users[socket.id]) {
            delete users[socket.id];
        }

        io.emit("receive_message", {
            id: `sys-${Date.now()}`,
            text: `${userName} sohbete ayrıldı.`,
            isSystem: true,
            timestamp: new Date(),
        });
    });

    socket.on("disconnect", () => {
        const userName = users[socket.id];
        if (userName) {
            if (userSessions[userName]) {
                delete userSessions[userName];
            }

            io.emit("receive_message", {
                id: `sys-${Date.now()}`,
                text: `${userName} sohbete ayrıldı.`,
                isSystem: true,
                timestamp: new Date(),
            });
            delete users[socket.id];
        }
        console.log("Kullanıcı ayrıldı:", socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`TurkFreelancer backend server ${PORT} portunda çalışıyor`));