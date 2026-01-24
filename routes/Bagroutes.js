const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const Bags = new Bag(req.body);
    const saveitem = await Bags.save();
    res.status(200).json(saveitem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:userid", async (req, res) => {
  try {
    // Only return items that are NOT saved for later (active cart items)
    const bag = await Bag.find({
      userId: req.params.userid,
      isSavedForLater: { $ne: true },
    }).populate("productId");
    res.status(200).json(bag);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Get saved-for-later items
router.get("/saved-for-later/:userid", async (req, res) => {
  try {
    const savedItems = await Bag.find({
      userId: req.params.userid,
      isSavedForLater: true,
    }).populate("productId");
    res.status(200).json(savedItems);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching saved items" });
  }
});

router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});

router.patch("/saveforlater/:itemid", async (req, res) => {
  try {
    const updatedItem = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { isSavedForLater: true },
      { new: true },
    ).populate("productId");
    res.status(200).json(updatedItem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving item for later" });
  }
});

router.patch("/movetobag/:itemid", async (req, res) => {
  try {
    const updatedItem = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { isSavedForLater: false },
      { new: true },
    ).populate("productId");
    res.status(200).json(updatedItem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error moving item to bag" });
  }
});

module.exports = router;
