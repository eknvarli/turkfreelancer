import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ PostgreSQL bağlantısı başarılı.");
    } catch (error) {
        console.error("❌ Veritabanı bağlantı hatası:", error);
    }
};
