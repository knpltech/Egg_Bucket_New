import { db } from "../config/firebase.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = "egg_secret_key";

export const loginUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role)
      return res.status(400).json({ success: false, error: "Missing credentials" });

    // Determine collection based on role
    let collection = null;
    if (role === 'admin') collection = 'admin';
    else if (role === 'viewer') collection = 'viewers';
    else return res.status(400).json({ success: false, error: "Invalid role" });

    const userRef = db.collection(collection).doc(username);
    const userSnap = await userRef.get();

    if (!userSnap.exists)
      return res.status(404).json({ success: false, error: "User not found" });

    const user = userSnap.data();

    // ROLE CHECK (admin: must have 'admin' in roles or role === 'Admin', viewer: must have 'viewer')
    if (role === 'admin') {
      const hasAdminRole = (Array.isArray(user.roles) && user.roles.includes('admin')) || user.role === 'Admin' || user.role === 'admin';
      if (!hasAdminRole) {
        return res.status(401).json({
          success: false,
          error: `You must select 'admin' role to login`,
        });
      }
    }
    if (role === 'viewer') {
      const hasViewerRole = (Array.isArray(user.roles) && user.roles.includes('viewer')) || user.role === 'Viewer' || user.role === 'viewer';
      if (!hasViewerRole) {
        return res.status(401).json({
          success: false,
          error: `You must select 'viewer' role to login`,
        });
      }
    }

    // Password check (bcrypt)
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    const token = jwt.sign(
      { username: user.username, role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });

  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
