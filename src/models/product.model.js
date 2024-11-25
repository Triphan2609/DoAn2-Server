import { DataTypes } from "sequelize";

const ProductModel = (sequelize) => {
    return sequelize.define(
        "Product",
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING(255),
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
                allowNull: false,
                references: {
                    model: "categories",
                    key: "category_id",
                },
                onDelete: "CASCADE",
            },
            image_url: {
                type: DataTypes.STRING(255),
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "products",
            timestamps: false,
        }
    );
};

export default ProductModel;
