const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

const expo = new Expo();

exports.registerToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { pushTokens: token },
    });

    res.status(200).json({
      success: true,
      message: "Token registered successfully",
    });
  } catch (error) {
    console.error("Error registering token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendPushToUser = async (userId, title, body, data) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      console.log(`No tokens found for user ${userId}`);
      return;
    }

    let messages = [];
    for (let token of user.pushTokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        continue;
      }
      messages.push({
        to: token,
        sound: "default",
        title: title,
        body: body,
        data: data,
      });
    }

    if (messages.length === 0) return;

    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error("Error sending chunks", error);
      }
    }
  } catch (error) {
    console.error("Error internally sending notification:", error);
  }
};

exports.sendNotificationInternal = async ({ userId, title, body, data }) => {
  await sendPushToUser(userId, title, body, data);
};

exports.sendNotification = async (req, res) => {
  const { userId, title, body, data } = req.body;

  try {
    await sendPushToUser(userId, title, body, data);
    res.json({ success: true, message: "Notifications processed" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.broadcastNotification = async (req, res) => {
  const { title, body, data } = req.body;

  try {
    // Find all users with push tokens
    const users = await User.find({
      pushTokens: { $exists: true, $not: { $size: 0 } },
    });

    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: "No users registered for notifications" });
    }

    let messages = [];
    for (let user of users) {
      for (let token of user.pushTokens) {
        if (!Expo.isExpoPushToken(token)) continue;
        messages.push({
          to: token,
          sound: "default",
          title: title,
          body: body,
          data: data,
        });
      }
    }

    if (messages.length === 0) {
      return res.status(200).json({ message: "No valid tokens found" });
    }

    let chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error("Error broadcasting chunk", error);
      }
    }

    res.json({
      success: true,
      message: `Broadcast sent to ${messages.length} devices`,
    });
  } catch (error) {
    console.error("Error broadcasting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
