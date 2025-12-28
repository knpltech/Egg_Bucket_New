import { db } from "../config/firebase.js";

// Add a new NECC rate entry to Firestore
export const addNeccRate = async (req, res) => {
  try {
    const { date, ...rest } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Missing required field: date" });
    }
    const docRef = await db.collection("neccRates").add({
      date,
      ...rest,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "NECC rate recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding NECC rate", error: error.message });
  }
};

// Get all NECC rate entries from Firestore
export const getAllNeccRates = async (req, res) => {
  try {
    const snapshot = await db.collection("neccRates").orderBy("date", "desc").get();
    const rates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching NECC rates", error: error.message });
  }
};
