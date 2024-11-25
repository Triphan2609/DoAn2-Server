import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
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
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.TEXT,
        },
        role: {
            type: DataTypes.ENUM("admin", "customer"),
            defaultValue: "customer",
        },
    },
    {
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    },

    {
        hooks: {
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 8);
            },
            beforeUpdate: async (user) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 8);
                }
            },
        },
    }
);

// Thêm các phương thức tùy chỉnh
User.prototype.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.getPublicProfile = function () {
    return {
        id: this.id,
        email: this.email,
        name: this.name,
        role: this.role,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
    };
};

export default User;
