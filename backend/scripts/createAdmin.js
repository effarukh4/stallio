// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run seed:admin
require("dotenv").config({ path: "config/.env" });
const mongoose = require("mongoose");
const User = require("../model/user");

(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Stallio Admin", DB_URL } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");
    process.exit(1);
  }
  await mongoose.connect(DB_URL);
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    existing.role = "Admin";
    await existing.save({ validateBeforeSave: false });
    console.log(`Promoted ${ADMIN_EMAIL} to Admin.`);
  } else {
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "Admin", avatar: { public_id: "admin", url: "" } });
    console.log(`Created admin ${ADMIN_EMAIL}.`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
