

import { db } from "../config/firebase.js";

// Add a new DailyDamage entry to Firestore
export const addDailyDamage = async (req, res) => {
  try {
    const { date, damages, total } = req.body;
    if (!date || !damages || typeof damages !== 'object') {
      return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    const snapshot = await db.collection("dailyDamages").where("date", "==", date).limit(1).get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const existing = data.damages || {};

      for (const k of Object.keys(damages)) {
        if (existing[k] !== undefined) {
          return res.status(409).json({ message: `Damage entry for outlet '${k}' already exists for ${date}` });
        }
      }

      const updatePayload = {};
      let newTotal = Number(data.total || 0);
      for (const [k, v] of Object.entries(damages)) {
        updatePayload[`damages.${k}`] = Number(v);
        newTotal += Number(v) || 0;
      }
      updatePayload.total = newTotal;

      await db.collection("dailyDamages").doc(doc.id).update(updatePayload);
      const updated = await db.collection("dailyDamages").doc(doc.id).get();
      return res.status(200).json({ id: doc.id, ...updated.data(), message: 'Daily damage merged' });
    }

    const docRef = await db.collection("dailyDamages").add({
      date,
      damages,
      total: total || Object.values(damages).reduce((s, n) => s + (Number(n)||0), 0),
      createdAt: new Date(),
    });
    res.status(201).json({ id: docRef.id, message: "Daily damage recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error adding daily damage", error: error.message });
  }
};

// PATCH controller to update a daily damage entry by ID
export const updateDailyDamage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const docRef = db.collection("dailyDamages").doc(id);
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.status(200).json({ id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: "Error updating daily damage", error: error.message });
  }
};
