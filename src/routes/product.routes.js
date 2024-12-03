import { Router } from "express";
import {
    createProduct,
    getAllProducts,
    getAllProductsAnimalPagination,
    getAllProductsCategoriesPagination,
    getAllProductsLimit10,
    getAllProductsPagination,
    getNewProducts,
    getProductDetails,
    getProductsByType,
    searchProducts,
} from "../controllers/product.controller.js";
import upload from "../config/multerConfig.js";

const router = Router();

router.get("/all", getAllProductsPagination);
router.get("/getOutstanding", getAllProductsLimit10);
router.get("/getNewProducts", getNewProducts);
router.get("/getByType", getProductsByType);
router.get("/getProductsCategory", getAllProductsCategoriesPagination);
router.get("/getProductsAnimals", getAllProductsAnimalPagination);
router.get("/getProductsDetail/:slug", getProductDetails);
router.get("/getProductsSearch", searchProducts);

router.post("/createProduct", upload, createProduct);

export default router;
