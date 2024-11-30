import { Router } from "express";
import {
    getAllCategories,
    getAllCategoriesForCat,
    getAllCategoriesForDog,
} from "../controllers/categories.model.js";
const router = Router();

router.get("/all", getAllCategories);
router.get("/dog", getAllCategoriesForDog);
router.get("/cat", getAllCategoriesForCat);

export default router;
