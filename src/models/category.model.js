import { DataTypes } from "sequelize";

const CategoryModel = (sequelize) => {
    return sequelize.define(
        "Category",
        {
            category_id: {
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
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "categories",
            timestamps: false,
        }
    );
};

export default CategoryModel;
