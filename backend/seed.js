const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured to seed the administrator");
  }

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) return;

  await Admin.create({
    name: "Garudasena Administrator",
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });
  console.log(`Seeded administrator account for ${email}`);
};

module.exports = seedAdmin;
