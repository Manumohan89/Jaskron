// One-time setup script: creates (or promotes) an admin account.
// Run locally or via Render's "Shell" tab after deployment:
//   node seedAdmin.js
//
// Reads credentials from env vars, with sensible fallbacks for local dev:
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@jaskron.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jaskron-technologies";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    user.isActive = true;
    user.emailVerified = true;
    await user.save();
    console.log(`Existing user "${email}" promoted to admin.`);
  } else {
    user = new User({ name, email, password, role: "admin", emailVerified: true });
    await user.save();
    console.log(`Admin account created.`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log("⚠️  Log in and change this password immediately.");
  }

  await mongoose.disconnect();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
