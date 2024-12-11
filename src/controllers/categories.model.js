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
