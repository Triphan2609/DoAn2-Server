import { DataTypes } from "sequelize";

const OrderDetailModel = (sequelize) => {
    return sequelize.define(
        "OrderDetail",
        {
            order_detail_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            order_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onDelete: "CASCADE",
            },
            product_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "products",
                    key: "product_id",
                },
                onDelete: "CASCADE",
            },
            unit_quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            unit_price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        },
        {
            tableName: "order_details",
            timestamps: true,
            underscored: true,
        }
    );
};

export default OrderDetailModel;
