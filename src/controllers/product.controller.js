import { models } from "../config/database.js";
import { Op } from "sequelize"; // Import Op for Sequelize operators
import moment from "moment"; // Import moment.js to handle date manipulation

const { Product, ProductType } = models; // Lấy User từ models đã khởi tạo

// Lấy tất cả các thương hiệu
export const getAllProducts = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const products = await Product.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};

export const getNewProducts = async (req, res) => {
    try {
        // Get the date 5 days ago
        const fiveDaysAgo = moment().subtract(5, "days").toDate();

        // Lấy sản phẩm có ngày tạo trong 5 ngày gần nhất
        const products = await Product.findAll({
            where: {
                created_at: {
                    [Op.gt]: fiveDaysAgo, //
                },
            },
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
    }
};

export const getAllProductsLimit10 = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const products = await Product.findAll({
            where: {
                quantity: {
                    [Op.gt]: 100, // Sử dụng Op.gt để lọc số lượng lớn hơn 100
                },
            },
            limit: 10,
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};

export const getProductsByType = async (req, res) => {
    try {
        // Lấy product_type_id từ query parameter
        const { product_type_id } = req.query;

        // Kiểm tra xem có truyền product_type_id hay không
        if (!product_type_id) {
            return res
                .status(400)
                .json({ message: "ID loại sản phẩm là bắt buộc" });
        }

        // Lấy tất cả sản phẩm có product_type_id tương ứng
        const products = await Product.findAll({
            limit: 3,
            where: {
                product_type_id: {
                    [Op.eq]: product_type_id, // Tìm sản phẩm có product_type_id khớp
                },
            },
            required: true, // Chỉ lấy các sản phẩm có loại sản phẩm phù hợp
        });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo ID loại:", error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách sản phẩm theo ID loại",
        });
    }
};
export const getAllProductsPagination = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "ASC",
            brand,
            minPrice,
            maxPrice,
        } = req.query;

        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        if (isNaN(limitInt) || limitInt <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
        }

        const offset = (pageInt - 1) * limitInt;

        const validSortFields = ["createdAt", "price", "name"];
        const validSortOrders = ["ASC", "DESC"];

        const sortColumn = validSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";
        const sortDirection = validSortOrders.includes(sortOrder)
            ? sortOrder
            : "ASC";

        const order = [[sortColumn, sortDirection]];

        const whereConditions = {};

        if (brand) whereConditions.brand_id = brand;
        if (minPrice && !isNaN(minPrice))
            whereConditions.price = { [Op.gte]: parseFloat(minPrice) };
        if (maxPrice && !isNaN(maxPrice))
            whereConditions.price = {
                ...whereConditions.price,
                [Op.lte]: parseFloat(maxPrice),
            };

        const products = await Product.findAll({
            where: whereConditions,
            limit: limitInt,
            offset: offset,
            order: order,
        });

        const totalProducts = await Product.count({ where: whereConditions });
        const totalPages = Math.ceil(totalProducts / limitInt);

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageInt,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limitInt,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy tất cả sản phẩm" });
    }
};
