import { DataTypes } from "sequelize";

const OrderModel = (sequelize) => {
    return sequelize.define(
        "Order",
        {
            order_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "user_id",
                },
                onDelete: "CASCADE",
            },
            total_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM("pending", "completed", "canceled"),
                defaultValue: "pending",
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                onUpdate: DataTypes.NOW,
            },
        },
        {
            tableName: "orders",
            timestamps: false,
        }
    );
};

export default OrderModel;
