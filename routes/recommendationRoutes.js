const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
// Optionally import auth middleware if we want to enforce logged-in user for history
const auth = require("../middleware/auth");

// Record user history (Auth preferred to get userId reliable, but logic in controller supports body userId)
// If we want to support guest history later, we might not use strict auth here.
// But prompt implies 'userId' and typically this is logged in.
// Let's use auth middleware but if token is missing, client might fail.
// Actually, for broad compatibility, let's leave it open but expect client to send what it has.
// Or better: use auth if available? The prompt says "Body: { userId... }".
// I will keep it open (no strict auth middleware) and let controller valid inputs.
router.post("/history", recommendationController.recordHistory);

router.get("/recommendations", recommendationController.getRecommendations);

module.exports = router;
