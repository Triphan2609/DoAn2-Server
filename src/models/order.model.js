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
        },
        {
            tableName: "orders",
            timestamps: true,
            underscored: true,
        }
    );
};

export default OrderModel;
