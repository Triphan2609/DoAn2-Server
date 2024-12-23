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
                allowNull: null,
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
            payment_method: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            customer_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
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
