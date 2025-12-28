import { db } from "../config/firebase.js";

// Add a new outlet
export const addOutlet = async (req, res) => {
  try {
    const { id, name, area, contact, phone, status, reviewStatus } = req.body;
    if (!id || !name || !area) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    await db.collection("outlets").doc(id).set({
      id,
      name,
      area,
      contact,
      phone,
      status,
      reviewStatus,
      createdAt: new Date()
    });
    return res.json({ success: true, message: "Outlet added successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get all outlets
export const getAllOutlets = async (req, res) => {
  try {
    const snapshot = await db.collection("outlets").get();
    const outlets = snapshot.docs.map(doc => doc.data());
    return res.json(outlets);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
