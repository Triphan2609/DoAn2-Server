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

export const addBrand = async (req, res) => {
    try {
        const { brand_id, name } = req.body;

        // Kiểm tra nếu thiếu dữ liệu cần thiết
        if (!brand_id || !name) {
            return res.status(400).json({
                ec: 0,
                message:
                    "Vui lòng cung cấp đầy đủ thông tin (brand_id và name)",
            });
        }

        // Kiểm tra xem brand_id đã tồn tại hay chưa
        const existingBrand = await Brand.findByPk(brand_id);
        if (existingBrand) {
            return res.status(409).json({
                ec: 0,
                message: "Brand ID đã tồn tại. Vui lòng sử dụng một ID khác.",
            });
        }

        // Thêm thương hiệu mới vào cơ sở dữ liệu
        const newBrand = await Brand.create({
            brand_id,
            name,
        });

        return res.status(201).json({
            ec: 1,
            message: "Thương hiệu đã được thêm thành công",
            brand: newBrand,
        });
    } catch (error) {
        console.error("Error adding brand:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi thêm thương hiệu",
        });
    }
};

export const updateBrand = async (req, res) => {
    try {
        const { brand_id } = req.params; // Lấy brand_id từ URL
        const { name } = req.body; // Lấy name từ request body

        if (!name) {
            return res.status(400).json({
                ec: 0,
                message: "Tên thương hiệu không được để trống",
            });
        }

        // Tìm thương hiệu theo ID
        const brand = await Brand.findByPk(brand_id);
        if (!brand) {
            return res.status(404).json({
                ec: 0,
                message: "Thương hiệu không tồn tại",
            });
        }

        // Cập nhật tên thương hiệu
        brand.name = name;
        await brand.save();

        return res.status(200).json({
            ec: 1,
            message: "Thương hiệu đã được cập nhật thành công",
            brand,
        });
    } catch (error) {
        console.error("Error updating brand:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi cập nhật thương hiệu",
        });
    }
};

export const deleteBrand = async (req, res) => {
    try {
        const { brand_id } = req.params;

        // Kiểm tra nếu không có brand_id
        if (!brand_id) {
            return res.status(400).json({
                ec: 0,
                message: "Vui lòng cung cấp brand_id",
            });
        }

        // Tìm thương hiệu theo ID
        const brand = await Brand.findByPk(brand_id);
        if (!brand) {
            return res.status(404).json({
                ec: 0,
                message: "Thương hiệu không tồn tại",
            });
        }

        // Xóa thương hiệu
        await brand.destroy();

        return res.status(200).json({
            ec: 1,
            message: "Thương hiệu đã được xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting brand:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi xóa thương hiệu",
        });
    }
};
