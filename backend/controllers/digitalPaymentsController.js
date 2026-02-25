import { db } from "../config/firebase.js";

// Update a digital payment entry by ID
export const updateDigitalPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, outlets } = req.body;
    if (!id || !date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }
    const total = Object.values(outlets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    await db.collection("digitalPayments").doc(id).update({
      date,
      outlets,
      total,
      updatedAt: new Date(),
    });
    res.status(200).json({ message: "Digital payment updated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating digital payment", error: error.message });
  }
};

// Add a new digital payment entry to Firestore
// Merge into existing date doc and prevent overwriting outlet values
export const addDigitalPayment = async (req, res) => {
  try {
    const { date, outlets } = req.body;
    if (!date || !outlets || typeof outlets !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const snapshot = await db.collection("digitalPayments").where("date", "==", date).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const existingOutlets = data.outlets || {};

      for (const k of Object.keys(outlets)) {
        if (existingOutlets[k] !== undefined) {
          return res.status(409).json({ message: `Digital payment for outlet '${k}' already exists for ${date}` });
        }
      }

      const updatePayload = {};
      for (const [k, v] of Object.entries(outlets)) {
        updatePayload[`outlets.${k}`] = Number(v);
      }

      await db.collection("digitalPayments").doc(doc.id).update(updatePayload);
      const updated = await db.collection("digitalPayments").doc(doc.id).get();
      return res.status(200).json({ id: doc.id, ...updated.data(), message: 'Digital payment merged' });
    }

    const total = Object.values(outlets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const docRef = await db.collection("digitalPayments").add({
      date,
      outlets,
      total,
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Digital payment recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding digital payment", error: error.message });
  }
};

// Get all digital payment entries from Firestore
export const getAllDigitalPayments = async (req, res) => {
  try {
    const snapshot = await db.collection("digitalPayments").orderBy("date", "desc").get();
    const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching digital payments", error: error.message });
  }
};
