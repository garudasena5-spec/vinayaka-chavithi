require("dotenv").config();

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDatabase = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");
const seedAdmin = require("./seed");

const app = express();
const port = process.env.PORT || 5000;
const origins = ["http://localhost:3000", "https://vinayaka-chavithi-five.vercel.app",process.env.FRONTEND_URL].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: (origin, callback) => !origin || origins.includes(origin) ? callback(null, true) : callback(new Error("CORS origin denied")), credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api", require("./routes/contentRoutes"));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  await seedAdmin();
  app.listen(port, () => console.log(`GARUDASENA backend running on port ${port}`));
};

start().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
