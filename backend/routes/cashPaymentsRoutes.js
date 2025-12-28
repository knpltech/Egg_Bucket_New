import express from "express";
import { addCashPayment, getAllCashPayments } from "../controllers/cashPaymentsController.js";

const router = express.Router();

// Add a new cash payment entry
router.post("/add", addCashPayment);

// Get all cash payment entries
router.get("/all", getAllCashPayments);

export default router;
