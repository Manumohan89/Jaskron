// One-time migration: this update adds email verification (OTP) to registration.
// Existing accounts created before this change don't have `emailVerified` set,
// which would lock them out of login. Run this once after deploying:
//   node migrateVerifyExistingUsers.js
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jaskron-technologies";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const result = await User.updateMany(
    { emailVerified: { $ne: true } },
    { $set: { emailVerified: true } }
  );
  console.log(`Marked ${result.modifiedCount} existing user(s) as email-verified.`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
