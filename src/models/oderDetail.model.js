import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Order } from "./Order.js";
import { Product } from "./Product.js";

const OrderDetail = sequelize.define(
    "OrderDetail",
    {
        order_detail_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        order_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Order,
                key: "order_id",
            },
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Product,
                key: "product_id",
            },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

export { OrderDetail };
