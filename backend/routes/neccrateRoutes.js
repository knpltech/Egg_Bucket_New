import express from "express";
import { addNeccRate, getAllNeccRates } from "../controllers/neccrateController.js";

const router = express.Router();

// Add a new NECC rate entry
router.post("/add", addNeccRate);

// Get all NECC rate entries
router.get("/all", getAllNeccRates);

export default router;
