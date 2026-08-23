const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Expense",
  new mongoose.Schema(
    {
      category: { type: String, required: true, trim: true, maxlength: 100 },
      amount: { type: Number, required: true, min: 0 },
      date: { type: Date, default: Date.now },
      isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);
