import { User } from "./User.js";
import { Order } from "./Order.js";
import { OrderDetail } from "./OrderDetail.js";
import { Product } from "./Product.js";
import { Category } from "./Category.js";
import { Service } from "./Service.js";
import { Blog } from "./Blog.js";
import { Review } from "./Review.js";

// Quan hệ giữa các bảng
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

Order.hasMany(OrderDetail, { foreignKey: "order_id", as: "details" });
OrderDetail.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

User.hasMany(Review, { foreignKey: "user_id", as: "reviews" });
Review.belongsTo(User, { foreignKey: "user_id", as: "user" });

Review.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Review.belongsTo(Service, { foreignKey: "service_id", as: "service" });

Blog.belongsTo(User, { foreignKey: "author_id", as: "author" });
