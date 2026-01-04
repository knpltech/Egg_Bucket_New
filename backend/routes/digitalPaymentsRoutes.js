
import express from "express";
import { addDigitalPayment, getAllDigitalPayments, updateDigitalPayment } from "../controllers/digitalPaymentsController.js";

const router = express.Router();

// Update a digital payment entry by ID
router.patch("/:id", updateDigitalPayment);

// Add a new digital payment entry
router.post("/add", addDigitalPayment);

// Get all digital payment entries
router.get("/all", getAllDigitalPayments);

export default router;
