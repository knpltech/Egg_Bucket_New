import { db } from "../config/firebase.js";

// Add a new cash payment entry to Firestore
export const addCashPayment = async (req, res) => {
  try {
    const { date, outlets } = req.body;
    if (!date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }
    // Calculate total
    const total = Object.values(outlets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const docRef = await db.collection("cashPayments").add({
      date,
      outlets,
      total,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Cash payment recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding cash payment", error: error.message });
  }
};

// Get all cash payment entries from Firestore
export const getAllCashPayments = async (req, res) => {
  try {
    const snapshot = await db.collection("cashPayments").orderBy("date", "desc").get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cash payments", error: error.message });
  }
};
