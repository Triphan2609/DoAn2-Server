import { DataTypes } from "sequelize";

const CategoryModel = (sequelize) => {
    return sequelize.define(
        "Category",
        {
            category_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            animal_id: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "animals",
                    key: "animal_id",
                },
                onDelete: "CASCADE",
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "categories",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["category_id", "animal_id"], // Đặt category_id và animal_id là khóa chính phức hợp
                },
            ],
        }
    );
};

export default CategoryModel;
