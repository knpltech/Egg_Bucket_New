import express from "express";
import { addDailyDamage } from "../controllers/dailyDamageController.js";
import { getAllDailyDamages } from "../controllers/dailyDamageGetController.js";

const router = express.Router();


// Route to add a daily damage entry
router.post("/add-daily-damage", addDailyDamage);

// Route to get all daily damages
router.get("/all", getAllDailyDamages);

export default router;
