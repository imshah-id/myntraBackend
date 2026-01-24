const mongoose = require("mongoose");

const BrowsingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      index: true, // For sorting by recent views
    },
  },
  { timestamps: true },
);

// Compound index to quickly find if a user viewed a specific product (optional, but good for uniqueness if needed)
BrowsingHistorySchema.index({ userId: 1, productId: 1 });

module.exports = mongoose.model("BrowsingHistory", BrowsingHistorySchema);
