import express from "express";
import { addNeccRate, getAllNeccRates, updateNeccRate } from "../controllers/neccrateController.js";

const router = express.Router();

// Add a new NECC rate entry
router.post("/add", addNeccRate);

// Route to update a NECC rate entry by ID
router.patch("/:id", updateNeccRate);

// Get all NECC rate entries
router.get("/all", getAllNeccRates);

export default router;
