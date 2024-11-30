import { Router } from "express";
import {
    getAllProducts,
    getAllProductsLimit10,
    getAllProductsPagination,
} from "../controllers/product.controller.js";
const router = Router();

router.get("/all", getAllProductsPagination);
router.get("/getOutstanding", getAllProductsLimit10);

export default router;
