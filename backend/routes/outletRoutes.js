import express from "express";
import { addOutlet, getAllOutlets, deleteOutlet } from "../controllers/outletController.js";

const router = express.Router();


router.post("/add", addOutlet);
router.get("/all", getAllOutlets);
router.delete("/delete/:id", deleteOutlet);

export default router;
