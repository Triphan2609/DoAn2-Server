import { Router } from "express";
import {
    createProduct,
    deleteImage,
    deleteProduct,
    addImages,
    getAllProductsAnimalPagination,
    getAllProductsCategoriesPagination,
    getAllProductsImages,
    getAllProductsLimit10,
    getAllProductsPagination,
    getAllProductsPaginationAdmin,
    getAllProductsType,
    getNewProducts,
    getProductDetails,
    getProductsByType,
    searchProducts,
    updateAllImages,
    updateProduct,
    updateSingleImage,
    createProductType,
    updateProductType,
    deleteProductType,
} from "../controllers/product.controller.js";
import { upload, uploadSingle } from "../config/multerConfig.js";

const router = Router();

router.get("/all", getAllProductsPagination);
router.get("/all/admin", getAllProductsPaginationAdmin);
router.get("/getOutstanding", getAllProductsLimit10);
router.get("/getNewProducts", getNewProducts);
router.get("/getByType", getProductsByType);
router.get("/getProductsCategory", getAllProductsCategoriesPagination);
router.get("/getProductsAnimals", getAllProductsAnimalPagination);
router.get("/getProductsDetail/:slug", getProductDetails);
router.get("/getProductsSearch", searchProducts);
router.get("/getAllImages", getAllProductsImages);

router.post("/createProduct", upload, createProduct);
router.post("/addImages", upload, addImages);

router.put("/updateProduct/:productId", updateProduct);
router.put("/updateAllImages", upload, updateAllImages);
router.put("/updateSingleImage", uploadSingle, updateSingleImage);

router.delete("/deleteProduct/:productId", deleteProduct);
router.delete("/deleteImage", deleteImage);

// PRODUCT TYPE
router.get("/product-type/all", getAllProductsType);
router.post("/product-type/createProductType", createProductType);
router.put(
    "/product-type/updateProductType/:product_type_id",
    updateProductType
);
router.delete(
    "/product-type/deleteProductType/:product_type_id",
    deleteProductType
);

export default router;
