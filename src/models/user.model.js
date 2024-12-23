import { DataTypes } from "sequelize";

const UserModel = (sequelize) => {
    return sequelize.define(
        "User",
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING(15),
                allowNull: true,
            },
            address: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            google_id: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true,
            },
            google_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            google_email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            role: {
                type: DataTypes.ENUM("admin", "customer"),
                defaultValue: "customer",
            },
            method: {
                type: DataTypes.ENUM("web", "google"),
                defaultValue: "web",
            },
        },
        {
            tableName: "users",
            timestamps: true,
            underscored: true,
        }
    );
};

export default UserModel;
