import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { connectDB, sequelize } from "./db.js";
import { Message } from "./models/Message.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
await connectDB();
await sequelize.sync({ alter: true });

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "chrome-extension://*"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || "turkfreelancer-secret-key",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

const users = {};
const userSessions = {};

passport.serializeUser((user, done) => {
    console.log("Serializing user:", user.displayName);
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    console.log("Deserializing user:", obj.displayName);
    done(null, obj);
});

app.get("/auth/logout", (req, res) => {
    console.log("Logout request received, user:", req.user?.displayName);

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

    req.logout((err) => {
        if (err) {
            console.error("Passport logout error:", err);
            return res.status(500).json({ success: false, error: "Logout failed" });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Session destroy error:", err);
                return res.status(500).json({ success: false, error: "Session destroy failed" });
            }

            res.clearCookie("connect.sid");
            console.log("Logout successful");
            res.json({ success: true, message: "Logged out successfully" });
        });
    });
});

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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

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