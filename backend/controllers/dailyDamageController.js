

import { db } from "../config/firebase.js";

// Add a new DailyDamage entry to Firestore
export const addDailyDamage = async (req, res) => {
  try {
    const { date, damages, total } = req.body;
    if (!date || !damages || typeof damages !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }
    const docRef = await db.collection("dailyDamages").add({
      date,
      damages,
      total: total || 0,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Daily damage recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding daily damage", error: error.message });
  }
};
