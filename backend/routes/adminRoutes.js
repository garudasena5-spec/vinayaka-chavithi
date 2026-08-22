const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { login, me } = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");

router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }), login);
router.get("/me", auth, me);

module.exports = router;
