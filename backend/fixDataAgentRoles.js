// fixDataAgentRoles.js
import { db } from "./config/firebase.js";

async function fixDataAgentRoles() {
  // Migrate all 'viewers' to 'dataagents' collection and update roles
  const snapshot = await db.collection("viewers").get();
  let updated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let roles = data.roles;
    if (!Array.isArray(roles)) {
      roles = String(roles || "")
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);
    }
    // Replace 'viewer' with 'dataagent' in roles
    roles = roles.map(r => r === "viewer" ? "dataagent" : r);
    if (!roles.includes("dataagent")) roles.push("dataagent");
    roles = Array.from(new Set(roles));
    // Set new role and collection
    await db.collection("dataagents").doc(doc.id).set({
      ...data,
      role: "DataAgent",
      roles
    });
    await db.collection("viewers").doc(doc.id).delete();
    updated++;
    console.log(`Migrated ${doc.id}:`, roles);
  }
  console.log(`Done. Migrated ${updated} users to dataagents.`);
}

fixDataAgentRoles().catch(console.error);
