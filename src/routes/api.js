import { Router } from "express";
import authRoutes from "./auth.routers.js";
import { getHomepage } from "../controllers/auth.controller.js";
// import productRoutes from "./product.routes.js";
// import userRoutes from "./user.routes.js";

const router = Router();
router.use("/home", getHomepage);
router.use("/auth", authRoutes);
// router.use("/products", productRoutes);
// router.use("/users", userRoutes);

export default router;

// File: src/routes/auth.routes.js
