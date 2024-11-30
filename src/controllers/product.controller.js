import { models } from "../config/database.js";

const { Product } = models; // Lấy User từ models đã khởi tạo

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

export const getAllProductsLimit10 = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const products = await Product.findAll({ limit: 10 });

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};

export const getAllProductsPagination = async (req, res) => {
    try {
        // Lấy page và limit từ query parameters
        const page = parseInt(req.query.page) || 1; // Mặc định là trang 1 nếu không có query 'page'
        const limit = parseInt(req.query.limit) || 10; // Mặc định là 10 sản phẩm mỗi trang nếu không có query 'limit'

        // Tính toán offset để phân trang
        const offset = (page - 1) * limit;

        // Lấy tất cả sản phẩm với phân trang
        const products = await Product.findAll({
            limit: limit,
            offset: offset,
        });

        // Lấy tổng số sản phẩm để tính toán tổng số trang
        const totalProducts = await Product.count();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalProducts / limit);

        // Trả về kết quả dưới dạng JSON
        res.status(200).json({
            products,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalProducts: totalProducts,
                limit: limit,
            },
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
    }
};
