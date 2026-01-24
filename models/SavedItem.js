const mongoose = require("mongoose");

const SavedItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    size: String,
    quantity: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("SavedItem", SavedItemSchema);
