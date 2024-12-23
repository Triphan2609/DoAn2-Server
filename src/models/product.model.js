import { DataTypes } from "sequelize";
import slugify from "slugify";

const ProductModel = (sequelize) => {
    return sequelize.define(
        "Product", // Tên mô hình (sẽ tạo bảng 'products')
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true, // Tự động tăng cho id sản phẩm
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false, // Tên sản phẩm là bắt buộc
            },
            description: {
                type: DataTypes.TEXT, // Mô tả sản phẩm có thể dài
                defaultValue: "", // Mặc định mô tả trống nếu không có giá trị
            },
            price: {
                type: DataTypes.DECIMAL(10, 3), // Kiểu dữ liệu giá trị sản phẩm
                allowNull: false, // Giá sản phẩm là bắt buộc
            },
            quantity: {
                type: DataTypes.INTEGER, // Số lượng sản phẩm
                allowNull: false, // Số lượng sản phẩm là bắt buộc
            },
            category_id: {
                type: DataTypes.STRING,
                allowNull: false, // Khóa ngoại liên kết với bảng categories
                references: {
                    model: "categories", // Bảng categories
                    key: "category_id", // Khóa chính trong bảng categories
                },
                onDelete: "CASCADE", // Nếu xóa category, sản phẩm cũng bị xóa
            },
            brand_id: {
                type: DataTypes.STRING,
                allowNull: false, // Khóa ngoại liên kết với bảng brands
                references: {
                    model: "brands", // Bảng brands
                    key: "brand_id", // Khóa chính trong bảng brands
                },
                onDelete: "CASCADE", // Nếu xóa brand, brand_id trong sản phẩm sẽ được đặt NULL
            },
            product_type_id: {
                type: DataTypes.STRING,
                allowNull: false, // Khóa ngoại liên kết với bảng product_types
                references: {
                    model: "product_types", // Bảng product_types
                    key: "product_type_id", // Khóa chính trong bảng product_types
                },
                onDelete: "CASCADE", // Nếu xóa product_type, sản phẩm cũng bị xóa
            },
            image_url: {
                type: DataTypes.TEXT, // URL ảnh của sản phẩm
                defaultValue: "", // Mặc định trống nếu không có giá trị
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true, // Đảm bảo slug là duy nhất trong cơ sở dữ liệu
            },
        },
        {
            tableName: "products", // Tên bảng trong cơ sở dữ liệu
            timestamps: true, // Để Sequelize tự động quản lý createdAt và updatedAt
            underscored: true,
            hooks: {
                beforeSave: async (product) => {
                    console.log("Before save hook triggered");
                    if (!product.slug) {
                        product.slug = slugify(product.name, {
                            lower: true,
                            strict: true,
                        });
                    }

                    // Kiểm tra nếu slug đã có trong database
                    const existingProduct =
                        await sequelize.models.Product.findOne({
                            where: { slug: product.slug },
                        });

                    if (existingProduct) {
                        product.slug = `${product.slug}-${Date.now()}`;
                        console.log(
                            "Updated slug with timestamp:",
                            product.slug
                        );
                    }
                },
            },
        }
    );
};

export default ProductModel;
