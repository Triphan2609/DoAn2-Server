import { DataTypes } from "sequelize";

const ProductTypeModel = (sequelize) => {
    return sequelize.define(
        "ProductType", // Tên mô hình (sẽ tạo bảng 'product_types')
        {
            product_type_id: {
                type: DataTypes.STRING, // ID loại sản phẩm
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255), // Tên loại sản phẩm
                allowNull: false, // Tên loại sản phẩm là bắt buộc
            },
            category_id: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "categories",
                    key: "category_id",
                },
                onDelete: "CASCADE",
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW, // Ngày tạo loại sản phẩm
            },
        },
        {
            tableName: "product_types", // Tên bảng trong cơ sở dữ liệu
            timestamps: false, // Không sử dụng createdAt và updatedAt
        }
    );
};

export default ProductTypeModel;
