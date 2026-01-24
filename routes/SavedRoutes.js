const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

// Get saved-for-later items
router.get("/:userid", async (req, res) => {
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

// Add item to saved for later (from bag)
router.patch("/add/:itemid", async (req, res) => {
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

// Move item back to bag (from saved)
router.patch("/move-to-bag/:itemid", async (req, res) => {
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
