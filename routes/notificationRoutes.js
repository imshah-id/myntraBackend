const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

// Register a push token to the user's account
router.post("/register-token", auth, notificationController.registerToken);

// Send a notification (Admin or Trigger based)
// Ideally this should be admin-only, but using basic auth for now as per plan
router.post(
  "/send-notification",
  auth,
  notificationController.sendNotification,
);

module.exports = router;
