// PATCH controller to update a cash payment entry by ID
export const updateCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const docRef = db.collection("cashPayments").doc(id);
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.status(200).json({ id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error updating cash payment", error: error.message });
  }
};
import { db } from "../config/firebase.js";

// Add a new cash payment entry to Firestore
// Merge into existing date doc and prevent overwriting outlet values
export const addCashPayment = async (req, res) => {
  try {
    const { date, outlets } = req.body;
    if (!date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const snapshot = await db.collection("cashPayments").where("date", "==", date).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const existingOutlets = data.outlets || {};

      for (const k of Object.keys(outlets)) {
        if (existingOutlets[k] !== undefined) {
          return res.status(409).json({ message: `Cash payment for outlet '${k}' already exists for ${date}` });
        }
      }

      const updatePayload = {};
      let newTotal = Number(data.total || 0);
      for (const [k, v] of Object.entries(outlets)) {
        updatePayload[`outlets.${k}`] = Number(v);
        newTotal += Number(v) || 0;
      }
      updatePayload.total = newTotal;

      await db.collection("cashPayments").doc(doc.id).update(updatePayload);
      const updated = await db.collection("cashPayments").doc(doc.id).get();
      return res.status(200).json({ id: doc.id, ...updated.data(), message: 'Cash payment merged' });
    }

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
