import express from "express";
import { addDailySales, getAllDailySales } from "../controllers/dailysalesController.js";

const router = express.Router();

// Add a new daily sales entry
router.post("/add", addDailySales);

// Get all daily sales entries
router.get("/all", getAllDailySales);

export default router;
