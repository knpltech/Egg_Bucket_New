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
// Behavior: if a document for the same `date` exists, merge the provided outlets into it.
// If an outlet key already exists for that date, return 409 to prevent overwrites.
export const addDailySales = async (req, res) => {
  try {
    const { date, outlets, total } = req.body;
    if (!date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // try to find an existing doc for the same date
    const snapshot = await db.collection("dailySales").where("date", "==", date).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const existingOutlets = data.outlets || {};

      // check for any outlet key conflict
      for (const k of Object.keys(outlets)) {
        if (existingOutlets[k] !== undefined) {
          return res.status(409).json({ message: `Sales for outlet '${k}' already exists for ${date}` });
        }
      }

      // no conflicts: add each outlet and update total
      const updatePayload = {};
      let newTotal = Number(data.total || 0);
      for (const [k, v] of Object.entries(outlets)) {
        updatePayload[`outlets.${k}`] = Number(v);
        newTotal += Number(v) || 0;
      }
      updatePayload.total = newTotal;

      await db.collection("dailySales").doc(doc.id).update(updatePayload);
      const updated = await db.collection("dailySales").doc(doc.id).get();
      return res.status(200).json({ id: doc.id, ...updated.data(), message: 'Daily sales merged' });
    }

    // no existing doc: create new
    const docRef = await db.collection("dailySales").add({
      date,
      outlets,
      total: Number(total) || Object.values(outlets).reduce((s, n) => s + (Number(n) || 0), 0),
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
