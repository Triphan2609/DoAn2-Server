import { models } from "../config/database.js";
const { Animal } = models; // Lấy User từ models đã khởi tạo

export const getAllAnimals = async (req, res) => {
    try {
        // Fetch all animals from the database
        const animals = await Animal.findAll();
        res.status(200).json(animals);
    } catch (error) {
        console.error("Error fetching animals:", error);
        res.status(500).json({ message: "Error fetching animals" });
    }
};

// Controller to get a specific animal by animal_id
export const getAnimalById = async (req, res) => {
    try {
        const { animalId } = req.params;

        // Fetch animal by animal_id
        const animal = await Animal.findOne({
            where: { animal_id: animalId },
        });

        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }

        res.status(200).json({ animal });
    } catch (error) {
        console.error("Error fetching animal:", error);
        res.status(500).json({ message: "Error fetching animal" });
    }
};
