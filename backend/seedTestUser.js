// Creates a pre-verified test user so you can log in immediately without
// dealing with OTP emails during local development/testing.
//   node seedTestUser.js
//
// Credentials created: test@jaskron.com / Test@1234
// This does NOT bypass admin 2FA — the admin account (seedAdmin.js) still
// requires the login OTP by design, since that's a real security feature.
// For a full bypass during dev, use SKIP_EMAIL_VERIFICATION=true in .env instead.
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.js";

const TEST_EMAIL = "test@jaskron.com";
const TEST_PASSWORD = "Test@1234";

async function run() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jaskron-technologies";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  let user = await User.findOne({ email: TEST_EMAIL });
  if (user) {
    user.password = TEST_PASSWORD;
    user.emailVerified = true;
    user.isActive = true;
    await user.save();
    console.log(`Existing test user reset: ${TEST_EMAIL}`);
  } else {
    user = new User({
      name: "Test User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "user",
      emailVerified: true,
      isActive: true
    });
    await user.save();
    console.log(`Test user created: ${TEST_EMAIL}`);
  }

  console.log("\nLogin with:");
  console.log(`  Email:    ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log("\n(This is a regular user — no OTP required, since it's pre-verified.)");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
