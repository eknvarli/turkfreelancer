import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email ve şifre zorunlu." });

        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ message: "Bu email zaten kayıtlı." });

        const user = await User.create({ email, password });
        res.json({ message: "Kayıt başarılı", user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası", error: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Şifre hatalı." });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "7d" }
        );

        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Sunucu hatası", error: err.message });
    }
});

router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "Token gerekli." });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");

        const user = await User.findByPk(decoded.id, { attributes: ["id", "email"] });
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

        res.json(user);
    } catch (err) {
        res.status(401).json({ message: "Geçersiz token." });
    }
});

router.post("/anonymous", async (req, res) => {
    try {
        let { nick } = req.body;

        if (!nick || nick.trim() === "") {
            nick = `Anonim_${Math.random().toString(36).substr(2, 6)}`;
        }

        const user = await User.create({
            name: nick,
            isAnonymous: true,
        });

        req.session.user = user;

        res.json({ user });
    } catch (err) {
        console.error("Anonim login hatası:", err);
        res.status(500).json({ message: "Anonim login başarısız" });
    }
});

export default router;
