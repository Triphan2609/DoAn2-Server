import { Router } from "express";
import authRoutes from "./auth.routers.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import brandRoutes from "./brand.routes.js";
import animalRoutes from "./animal.routes.js";
import orderRoutes from "./order.routes.js";

import { getHomepage } from "../controllers/auth.controller.js";

const router = Router();
router.use("/home", getHomepage);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/animal", animalRoutes);
router.use("/order", orderRoutes);

export default router;

// File: src/routes/auth.routes.js
