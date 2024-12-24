import { Router } from "express";
import {
    callBackSuccess,
    checkoutCOD,
    checkoutZaloPay,
    deleteOrder,
    getAllOrderByUserId,
    getAllOrdersWithPagination,
    getOrderProducts,
    updateOrderStatus,
} from "../controllers/order.controller.js";
const router = Router();

router.get("/all", getAllOrdersWithPagination);
router.get("/:userId", getAllOrderByUserId);
router.get("/getAllProductsByOrderId/:order_id", getOrderProducts);

router.post("/cod", checkoutCOD);
router.post("/zalopay", checkoutZaloPay);
router.post("/zalopay/callback", callBackSuccess);

router.put("/updateStatus/:order_id", updateOrderStatus);

router.delete("/deleteOrder/:order_id", deleteOrder);

export default router;
