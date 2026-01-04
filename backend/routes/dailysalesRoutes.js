import express from "express";
import { addDailySales, getAllDailySales, updateDailySales } from "../controllers/dailysalesController.js";

const router = express.Router();

// Add a new daily sales entry
router.post("/add", addDailySales);

// Route to update a daily sales entry by ID
router.patch("/:id", updateDailySales);

// Get all daily sales entries
router.get("/all", getAllDailySales);

export default router;
