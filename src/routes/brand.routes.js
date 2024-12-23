import { Router } from "express";
import {
    addBrand,
    deleteBrand,
    getAllBrands,
    updateBrand,
} from "../controllers/brand.controller.js";
const router = Router();

router.get("/all", getAllBrands);

router.post("/createBrand", addBrand);

router.put("/updateBrand/:brand_id", updateBrand);

router.delete("/deleteBrand/:brand_id", deleteBrand);

export default router;
