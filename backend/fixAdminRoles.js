// fixAdminRoles.js
import { db } from "./config/firebase.js";

async function fixAdminRoles() {
  const snapshot = await db.collection("admin").get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let roles = data.roles;
    if (!Array.isArray(roles)) {
      roles = String(roles || "")
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);
      if (!roles.includes("admin")) roles.push("admin");
      roles = Array.from(new Set(roles));
      await db.collection("admin").doc(doc.id).update({ roles });
      updated++;
      console.log(`Updated ${doc.id}:`, roles);
    }
  }
  console.log(`Done. Updated ${updated} admin users.`);
}

fixAdminRoles().catch(console.error);
