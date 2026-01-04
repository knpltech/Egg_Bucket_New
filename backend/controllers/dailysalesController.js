// PATCH controller to update a daily sales entry by ID
export const updateDailySales = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const docRef = db.collection("dailySales").doc(id);
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.status(200).json({ id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error updating daily sales", error: error.message });
  }
};
import { db } from "../config/firebase.js";

// Add a new daily sales entry to Firestore
export const addDailySales = async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Missing required field: date" });
    }
    const docRef = await db.collection("dailySales").add({
      date,
      ...rest,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Daily sales recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding daily sales", error: error.message });
  }
};

// Get all daily sales entries from Firestore
export const getAllDailySales = async (req, res) => {
  try {
    const snapshot = await db.collection("dailySales").orderBy("date", "desc").get();
    const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching daily sales", error: error.message });
  }
};
