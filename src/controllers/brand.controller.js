import { models } from "../config/database.js";

const { Brand } = models;

// Lấy tất cả các thương hiệu
export const getAllBrands = async (req, res) => {
    try {
        // Lấy tất cả thương hiệu từ cơ sở dữ liệu
        const brands = await Brand.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thương hiệu" });
    }
};
