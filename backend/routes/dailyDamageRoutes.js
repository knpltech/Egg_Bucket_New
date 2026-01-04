
import express from "express";
import { addDailyDamage, updateDailyDamage } from "../controllers/dailyDamageController.js";
import { getAllDailyDamages } from "../controllers/dailyDamageGetController.js";

const router = express.Router();

// Route to add a daily damage entry
router.post("/add-daily-damage", addDailyDamage);

// Route to update a daily damage entry by ID
router.patch("/:id", updateDailyDamage);

// Route to get all daily damages
router.get("/all", getAllDailyDamages);

export default router;
