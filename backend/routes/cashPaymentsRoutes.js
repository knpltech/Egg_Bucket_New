import express from "express";
import { addCashPayment, getAllCashPayments, updateCashPayment } from "../controllers/cashPaymentsController.js";

const router = express.Router();

// Add a new cash payment entry
router.post("/add", addCashPayment);

// Route to update a cash payment entry by ID
router.patch("/:id", updateCashPayment);

// Get all cash payment entries
router.get("/all", getAllCashPayments);

export default router;
