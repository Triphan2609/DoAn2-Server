import { Router } from "express";
import {
    getAllProducts,
    getAllProductsLimit10,
    getAllProductsPagination,
    getNewProducts,
    getProductsByType,
} from "../controllers/product.controller.js";
const router = Router();

router.get("/all", getAllProductsPagination);
router.get("/getOutstanding", getAllProductsLimit10);
router.get("/getNewProducts", getNewProducts);
router.get("/getByType", getProductsByType);

export default router;
