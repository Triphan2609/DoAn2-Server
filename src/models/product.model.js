import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Category } from "./Category.js";

const Product = sequelize.define(
    "Product",
    {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Category,
                key: "category_id",
            },
        },
        image_url: {
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);

export { Product };
