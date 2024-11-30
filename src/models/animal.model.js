import { DataTypes } from "sequelize";

const AnimalModel = (sequelize) => {
    return sequelize.define(
        "Animal",
        {
            animal_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false, // Chó, Mèo
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "animals",
            timestamps: false, // No timestamps needed
        }
    );
};

export default AnimalModel;
