import { models } from "../config/database.js";

const { Category, Animal } = models;

// Controller để lấy tất cả danh mục
export const getAllCategories = async (req, res) => {
    try {
        // Lấy tất cả categories từ cơ sở dữ liệu
        const categories = await Category.findAll();

        // Trả về kết quả dưới dạng JSON
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh mục" });
    }
};

// Controller để lấy tất cả categories cho chó
export const getAllCategoriesForDog = async (req, res) => {
    try {
        // Tìm category của các loài vật liên quan đến "Chó"
        const dogAnimal = await Animal.findOne({
            where: { name: "Chó" }, // Lọc theo tên loài vật là "Chó"
        });

        // Nếu không tìm thấy loài vật "Chó"
        if (!dogAnimal) {
            return res
                .status(404)
                .json({ message: "Loài vật 'Chó' không tìm thấy." });
        }

        // Tìm tất cả categories có liên kết với "Chó"
        const categoriesForDog = await Category.findAll({
            where: { animal_id: dogAnimal.animal_id }, // Lọc category theo animal_id là "Chó"
        });

        // Trả về danh sách các categories cho chó
        res.status(200).json(categoriesForDog);
    } catch (error) {
        console.error("Error fetching categories for dog:", error);
        res.status(500).json({ message: "Lỗi khi lấy các danh mục cho chó" });
    }
};

export const getAllCategoriesForCat = async (req, res) => {
    try {
        // Tìm category của các loài vật liên quan đến "Mèo"
        const dogAnimal = await Animal.findOne({
            where: { name: "Mèo" }, // Lọc theo tên loài vật là "Mèo"
        });

        // Nếu không tìm thấy loài vật "Mèo"
        if (!dogAnimal) {
            return res
                .status(404)
                .json({ message: "Loài vật 'Mèo' không tìm thấy." });
        }

        // Tìm tất cả categories có liên kết với "Mèo"
        const categoriesForDog = await Category.findAll({
            where: { animal_id: dogAnimal.animal_id }, // Lọc category theo animal_id là "Mèo"
        });

        // Trả về danh sách các categories cho Mèo
        res.status(200).json(categoriesForDog);
    } catch (error) {
        console.error("Error fetching categories for dog:", error);
        res.status(500).json({ message: "Lỗi khi lấy các danh mục cho Mèo" });
    }
};

export const addCategory = async (req, res) => {
    try {
        const { category_id, name, animal_id } = req.body;

        // Kiểm tra nếu thiếu dữ liệu cần thiết
        if (!category_id || !name || !animal_id) {
            return res.status(400).json({
                ec: 0,
                message:
                    "Vui lòng cung cấp đầy đủ thông tin (category_id, name và animal_id)",
            });
        }

        // Kiểm tra xem category_id đã tồn tại hay chưa
        const existingCategory = await Category.findByPk(category_id);
        if (existingCategory) {
            return res.status(409).json({
                ec: 0,
                message:
                    "Category ID đã tồn tại. Vui lòng sử dụng một ID khác.",
            });
        }

        // Kiểm tra xem animal_id có tồn tại trong bảng animals không
        const existingAnimal = await Animal.findByPk(animal_id);
        if (!existingAnimal) {
            return res.status(404).json({
                ec: 0,
                message: "Animal ID không tồn tại. Vui lòng kiểm tra lại.",
            });
        }

        // Thêm danh mục mới vào cơ sở dữ liệu
        const newCategory = await Category.create({
            category_id,
            name,
            animal_id,
        });

        return res.status(201).json({
            ec: 1,
            message: "Danh mục đã được thêm thành công",
            category: newCategory,
        });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi thêm danh mục",
        });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { category_id } = req.params; // Lấy category_id từ URL
        const { name, animal_id } = req.body; // Lấy name và animal_id từ request body

        // Kiểm tra nếu thiếu dữ liệu cần thiết
        if (!name || !animal_id) {
            return res.status(400).json({
                ec: 0,
                message:
                    "Vui lòng cung cấp đầy đủ thông tin (name và animal_id)",
            });
        }

        // Tìm danh mục theo ID
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({
                ec: 0,
                message: "Danh mục không tồn tại",
            });
        }

        // Kiểm tra xem animal_id có tồn tại trong bảng animals không
        const existingAnimal = await Animal.findByPk(animal_id);
        if (!existingAnimal) {
            return res.status(404).json({
                ec: 0,
                message: "Animal ID không tồn tại. Vui lòng kiểm tra lại.",
            });
        }

        // Cập nhật danh mục
        category.name = name;
        category.animal_id = animal_id;
        await category.save();

        return res.status(200).json({
            ec: 1,
            message: "Danh mục đã được cập nhật thành công",
            category,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi cập nhật danh mục",
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        // Kiểm tra nếu không có category_id
        if (!category_id) {
            return res.status(400).json({
                ec: 0,
                message: "Vui lòng cung cấp category_id",
            });
        }

        // Tìm danh mục theo ID
        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({
                ec: 0,
                message: "Danh mục không tồn tại",
            });
        }

        // Xóa danh mục
        await category.destroy();

        return res.status(200).json({
            ec: 1,
            message: "Danh mục đã được xóa thành công",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({
            ec: 0,
            message: "Đã có lỗi xảy ra khi xóa danh mục",
        });
    }
};
