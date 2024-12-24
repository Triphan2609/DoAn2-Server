import { Router } from "express";
import {
    addCategory,
    deleteCategory,
    getAllCategories,
    getAllCategoriesForCat,
    getAllCategoriesForDog,
    updateCategory,
} from "../controllers/categories.controller.js";
const router = Router();

router.get("/all", getAllCategories);
router.get("/dog", getAllCategoriesForDog);
router.get("/cat", getAllCategoriesForCat);

router.post("/createCategory", addCategory);

router.put("/updateCategory/:category_id", updateCategory);

router.delete("/deleteCategory/:category_id", deleteCategory);

export default router;
