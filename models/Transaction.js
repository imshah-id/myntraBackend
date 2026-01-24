const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Optional for now to support old transactions or non-order transactions
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["Online", "COD", "Refund"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      required: true,
      default: "Pending",
    },
    paymentMode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Compound indexes for efficient filtering
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model("Transaction", TransactionSchema);
