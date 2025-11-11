import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, sequelize } from "./db.js";
import { Message } from "./models/Message.js";

dotenv.config();
await connectDB();
await sequelize.sync({ alter: true });

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" },
});

const users = {};

io.on("connection", (socket) => {
    console.log("Yeni kullanıcı bağlandı:", socket.id);

    socket.on("join_chat", async (nick) => {
        users[socket.id] = nick;
        console.log(`${nick} sohbete katıldı`);

        const lastMessages = await Message.findAll({
            order: [["id", "ASC"]],
            limit: 50,
        });
        socket.emit("previous_messages", lastMessages);

        io.emit("receive_message", {
            id: `sys-${Date.now()}`,
            text: `${nick} sohbete katıldı!`,
            isSystem: true,
            timestamp: new Date(),
        });
    });

    socket.on("send_message", async (msg) => {
        const realNick = users[socket.id] || "Anonim";

        const saved = await Message.create({
            user: realNick,
            text: msg.text,
            timestamp: new Date(),
        });

        io.emit("receive_message", saved);
    });

    socket.on("disconnect", () => {
        const nick = users[socket.id];
        if (nick) {
            io.emit("receive_message", {
                id: `sys-${Date.now()}`,
                text: `${nick} sohbete ayrıldı.`,
                isSystem: true,
                timestamp: new Date(),
            });
            delete users[socket.id];
        }
        console.log("Kullanıcı ayrıldı:", socket.id);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
    console.log("TurkFreelancer backend server 4000 portunda çalışıyor")
);
