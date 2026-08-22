const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return res.json({ success: true, data: { token, admin: { id: admin.id, name: admin.name, email: admin.email } } });
  } catch (error) {
    next(error);
  }
};

exports.me = (req, res) => res.json({ success: true, data: { id: req.admin.id, name: req.admin.name, email: req.admin.email } });
