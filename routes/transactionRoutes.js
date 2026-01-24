const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

// Create transaction (POST)
router.post("/", transactionController.createTransaction);

// Get transactions (Listing)
router.get("/", transactionController.getTransactions);

// Export transactions (PDF/CSV)
router.get("/export", transactionController.exportTransactions);

module.exports = router;
