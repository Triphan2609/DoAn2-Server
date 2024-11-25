import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: "mysql",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connection has been established successfully.");

        if (process.env.NODE_ENV === "development") {
            await sequelize.sync({ alter: true });
            console.log("All models were synchronized successfully.");
        }
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
};
