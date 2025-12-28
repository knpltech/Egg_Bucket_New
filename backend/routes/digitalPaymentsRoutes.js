import express from "express";
import { addDigitalPayment, getAllDigitalPayments } from "../controllers/digitalPaymentsController.js";

const router = express.Router();

// Add a new digital payment entry
router.post("/add", addDigitalPayment);

// Get all digital payment entries
router.get("/all", getAllDigitalPayments);

export default router;
