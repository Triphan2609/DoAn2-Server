import { Router } from "express";
import {
    callBackSuccess,
    checkoutCOD,
    checkoutZaloPay,
    getAllOrderByUserId,
    getAllOrdersWithPagination,
} from "../controllers/order.controller.js";
const router = Router();

router.get("/all", getAllOrdersWithPagination);
router.get("/:userId", getAllOrderByUserId);
router.post("/cod", checkoutCOD);
router.post("/zalopay", checkoutZaloPay);
router.post("/zalopay/callback", callBackSuccess);

export default router;
