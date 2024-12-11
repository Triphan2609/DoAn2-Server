import { Router } from "express";
import { checkoutCOD } from "../controllers/order.controller.js";
const router = Router();

router.post("/cod", checkoutCOD);
// router.post("/login", login);
// router.post("/google", google);

export default router;
