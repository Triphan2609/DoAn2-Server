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
        },
        {
            tableName: "animals",
            timestamps: true,
        }
    );
};

export default AnimalModel;
