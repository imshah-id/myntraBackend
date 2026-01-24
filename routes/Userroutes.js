const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const existinguser = await User.findOne({ email });
    if (existinguser)
      return res.status(404).json({ message: "User already exisits" });
    const hashedpassword = await bcrypt.hash(password, 10);
    const user = new User({
      fullName,
      email,
      password: hashedpassword,
    });
    await user.save();
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || "secret_key_change_me",
    );
    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.status(404).json({ message: "Invalid password" });
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || "secret_key_change_me",
    );

    const { password: _, ...userData } = user.toObject();
    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});
module.exports = router;
