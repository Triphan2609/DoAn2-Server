import { Router } from "express";
import { getAllAnimals } from "../controllers/animal.controller.js";

const router = Router();

router.get("/all", getAllAnimals);

export default router;
