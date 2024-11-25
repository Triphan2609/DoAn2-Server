import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./User.js";

const Blog = sequelize.define(
    "Blog",
    {
        blog_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        author_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "user_id",
            },
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export { Blog };
