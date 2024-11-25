import UserModel from "./user.model.js";
import CategoryModel from "./category.model.js";
import ProductModel from "./product.model.js";
import OrderModel from "./order.model.js";
import OrderDetailModel from "./orderDetail.model.js";
import BlogModel from "./blog.model.js";

const initModels = (sequelize) => {
    const User = UserModel(sequelize);
    const Category = CategoryModel(sequelize);
    const Product = ProductModel(sequelize);
    const Order = OrderModel(sequelize);
    const OrderDetail = OrderDetailModel(sequelize);
    const Blog = BlogModel(sequelize);

    // Relationships
    User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
    Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

    Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
    Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

    Order.hasMany(OrderDetail, { foreignKey: "order_id", as: "details" });
    OrderDetail.belongsTo(Order, { foreignKey: "order_id", as: "order" });

    Product.hasMany(OrderDetail, {
        foreignKey: "product_id",
        as: "orderDetails",
    });
    OrderDetail.belongsTo(Product, { foreignKey: "product_id", as: "product" });

    User.hasMany(Blog, { foreignKey: "author_id", as: "blogs" });
    Blog.belongsTo(User, { foreignKey: "author_id", as: "author" });

    return {
        User,
        Category,
        Product,
        Order,
        OrderDetail,
        Blog,
    };
};

export default initModels;
