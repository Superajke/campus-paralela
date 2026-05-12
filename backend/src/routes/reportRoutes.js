import { Router } from "express";
import { inventory } from "../controllers/reportController.js";

const router = Router();

router.get("/inventory", inventory);

export default router;
