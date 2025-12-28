import { db } from "../config/firebase.js";

// Add a new distributor entry to Firestore
export const addDistributor = async (req, res) => {
  try {
    const { date, outlets } = req.body;
    if (!date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }
    // Calculate total
    const total = Object.values(outlets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const docRef = await db.collection("distributors").add({
      date,
      outlets,
      total,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Distributor entry recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding distributor entry", error: error.message });
  }
};

// Get all distributor entries from Firestore
export const getAllDistributors = async (req, res) => {
  try {
    const snapshot = await db.collection("distributors").orderBy("date", "desc").get();
    const distributors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(distributors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching distributor entries", error: error.message });
  }
};
