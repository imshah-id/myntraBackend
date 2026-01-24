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

exports.sendNotification = async (req, res) => {
  const { userId, title, body, data } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.pushTokens || user.pushTokens.length === 0) {
      return res
        .status(404)
        .json({ message: "User has no registered devices" });
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

    if (messages.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid tokens found for user" });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    // Async function to handle chunks, but we want to wait for at least initial send to fail/succeed or just fire and forget?
    // The example code used an IIFE (async () => { ... })(); and returned response immediately.
    // I will await it to provide better feedback if possible, or stick to example pattern if response time is critical.
    // However, usually it's better to await if we want to confirm simple delivery to Expo API.

    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunks", error);
      }
    }

    // We can inspect tickets here if needed to see if there are errors (like DeviceNotRegistered)
    // For now, simpler implementation as per request snippet.

    res.json({ success: true, message: "Notifications processed", tickets });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
