const notificationController = require("../controllers/notificationController");
const Product = require("../models/Product");

let intervalId = null;

const startScheduler = () => {
  if (intervalId) return;

  console.log("Starting Offer Scheduler...");

  // Interval: Every 5 minutes for demo purposes (can be adjusted)
  const INTERVAL_MS = 2 * 60 * 1000;

  intervalId = setInterval(async () => {
    try {
      console.log("Running Offer Scheduler Job...");

      // 1. Pick a random product that has a discount
      // Note: In a real app we might want to be more selective.
      // Since we don't know the exact schema content volume, we use aggregate sample.
      const products = await Product.aggregate([
        { $match: { discount: { $exists: true, $ne: "" } } },
        { $sample: { size: 1 } },
      ]);

      if (products.length === 0) {
        console.log("No discounted products found for offer.");
        return;
      }

      const product = products[0];

      // 2. Construct the notification content
      const title = `🔥 Deal of the Day: ${product.brand} - ${product.discount}!`;
      const body = `Get the ${product.name} for just ₹${product.price}. Limited time offer!`;

      // 3. Broadcast the notification
      // We need to mock req/res or call an internal method.
      // notificationController.broadcastNotification expects req.body and uses res.json.
      // We should ideally have a separate service or internal method.
      // Assuming we can't easily refactor `broadcastNotification` to be pure internal right now without changing its signature,
      // let's look at `sendNotificationInternal` which we added.
      // BUT `sendNotificationInternal` is for a SINGLE user.

      // Let's create an internal broadcast helper in the scheduler or refactor controller.
      // Re-using the logic from the controller is best.
      // Since I can't easily import `broadcastNotification` as a function that returns data (it sends response),
      // I will import the logic or refactor the controller to expose an internal method.
      // Looking at step 169/177, `broadcastNotification` is tied to `req, res`.

      // QUICK FIX: I will implement the broadcast logic here using the User model directly,
      // similar to how I implemented it in the controller, to avoid refactoring the controller again
      // and breaking the API contract or getting into messy deps.
      // Ideally code reuse, but for this task flexibility is key.

      // Actually, I can require User and Expo here.
      const User = require("../models/User");
      const { Expo } = require("expo-server-sdk");
      const expo = new Expo();

      const users = await User.find({
        pushTokens: { $exists: true, $not: { $size: 0 } },
      });
      if (users.length === 0) return;

      let messages = [];
      for (let user of users) {
        for (let token of user.pushTokens) {
          if (!Expo.isExpoPushToken(token)) continue;
          messages.push({
            to: token,
            sound: "default",
            title: title,
            body: body,
            data: { type: "offer", productId: product._id },
          });
        }
      }

      if (messages.length === 0) return;

      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error("Error broadcasting offer chunk", error);
        }
      }

      console.log(
        `Sent automated offer for ${product.name} to ${messages.length} devices.`,
      );
    } catch (error) {
      console.error("Error in Offer Scheduler:", error);
    }
  }, INTERVAL_MS);
};

module.exports = { startScheduler };
