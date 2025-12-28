import express from "express";
import { addDistributor, getAllDistributors } from "../controllers/distributorController.js";

const router = express.Router();

// Add a new distributor entry
router.post("/add", addDistributor);

// Get all distributor entries
router.get("/all", getAllDistributors);

export default router;
