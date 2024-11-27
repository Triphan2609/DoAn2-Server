import { Router } from "express";
import { register, login, google } from "../controllers/auth.controller.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", google);

export default router;
