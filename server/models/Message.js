import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Message = sequelize.define('Message', {
    user: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});