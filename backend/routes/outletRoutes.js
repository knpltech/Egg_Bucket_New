import express from "express";
import { addOutlet, getAllOutlets } from "../controllers/outletController.js";

const router = express.Router();

router.post("/add", addOutlet);
router.get("/all", getAllOutlets);

export default router;
