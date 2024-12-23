import UserModel from "./user.model.js";
import CategoryModel from "./category.model.js";
import ProductModel from "./product.model.js";
import OrderModel from "./order.model.js";
import OrderDetailModel from "./orderDetail.model.js";
import AnimalModel from "./animal.model.js";
import BrandModel from "./brand.model.js";
import ProductTypeModel from "./productType.model.js";

const initModels = (sequelize) => {
    const User = UserModel(sequelize);
    const Category = CategoryModel(sequelize);
    const Product = ProductModel(sequelize);
    const Order = OrderModel(sequelize);
    const OrderDetail = OrderDetailModel(sequelize);
    const Animal = AnimalModel(sequelize);
    const Brand = BrandModel(sequelize);
    const ProductType = ProductTypeModel(sequelize);

    // User has many Orders (1 to many)
    User.hasMany(Order, { foreignKey: "user_id" });
    Order.belongsTo(User, { foreignKey: "user_id" });

    // Category has many Products (1 to many)
    Category.hasMany(Product, { foreignKey: "category_id" });
    Product.belongsTo(Category, { foreignKey: "category_id" });

    // Animal has many Categories (1 to many)
    Animal.hasMany(Category, { foreignKey: "animal_id" });
    Category.belongsTo(Animal, { foreignKey: "animal_id" });

    // Order has many OrderDetails (1 to many)
    Order.hasMany(OrderDetail, { foreignKey: "order_id" });
    OrderDetail.belongsTo(Order, { foreignKey: "order_id" });

    // Product has many OrderDetails (1 to many)
    Product.hasMany(OrderDetail, { foreignKey: "product_id" });
    OrderDetail.belongsTo(Product, { foreignKey: "product_id" });

    // Brand has many Products (1 to many)
    Brand.hasMany(Product, { foreignKey: "brand_id" });
    Product.belongsTo(Brand, { foreignKey: "brand_id" });

    // Category has many Products (1 to many)
    Category.hasMany(ProductType, { foreignKey: "category_id" });
    ProductType.belongsTo(Category, { foreignKey: "category_id" });

    ProductType.hasMany(Product, { foreignKey: "product_type_id" });
    Product.belongsTo(ProductType, { foreignKey: "product_type_id" });

    return {
        User,
        Category,
        Product,
        Order,
        OrderDetail,
        Animal,
        Brand,
        ProductType,
    };
};

export default initModels;
