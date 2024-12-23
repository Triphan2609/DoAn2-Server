import { Router } from "express";
import {
    changePassword,
    createUser,
    deleteUser,
    getAllUsersWithPagination,
    updateUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/all", getAllUsersWithPagination);

router.post("/create", createUser);

router.put("/update/:userId", updateUser);

router.delete("/delete/:userId", deleteUser);

router.post("/changePass", changePassword);

export default router;
