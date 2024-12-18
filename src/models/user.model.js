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
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
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
                allowNull: true, // Có thể null nếu người dùng không đăng nhập bằng Google
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
        },
        {
            tableName: "users",
            timestamps: true,
            underscored: true,
        }
    );
};

export default UserModel;
