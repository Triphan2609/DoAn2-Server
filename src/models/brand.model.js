import { DataTypes } from "sequelize";

const BrandModel = (sequelize) => {
    return sequelize.define(
        "Brand", // Tên mô hình, trùng với tên bảng
        {
            brand_id: {
                type: DataTypes.STRING,
                primaryKey: true, // Khóa chính
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false, // Không cho phép giá trị null cho tên thương hiệu
            },
        },
        {
            tableName: "brands", // Tên bảng trong cơ sở dữ liệu
            timestamps: true, //
            underscored: true,
        }
    );
};

export default BrandModel;
