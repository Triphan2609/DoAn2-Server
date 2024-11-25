import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import initModels from "../models/index.js";

dotenv.config();

// Tạo đối tượng sequelize với cấu hình kết nối từ các biến môi trường
export const sequelize = new Sequelize(
    process.env.DB_NAME, // Database name
    process.env.DB_USER, // Database username
    process.env.DB_PASS, // Database password
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: console.log,
    }
);

export const models = initModels(sequelize);

// Kết nối cơ sở dữ liệu
export const connectDB = async () => {
    try {
        // Kiểm tra kết nối cơ sở dữ liệu
        await sequelize.authenticate();
        console.log("Database connected successfully");

        // Đồng bộ hóa các model với cơ sở dữ liệu
        await sequelize.sync({ alter: true }); // Tạo bảng nếu chưa tồn tại
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
