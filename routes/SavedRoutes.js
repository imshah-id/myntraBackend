const express = require("express");
const Bag = require("../models/Bag");
const SavedItem = require("../models/SavedItem");
const router = express.Router();

// Get saved-for-later items
router.get("/:userid", async (req, res) => {
  try {
    // Fetch from the new dedicated collection
    const savedItems = await SavedItem.find({
      userId: req.params.userid,
    }).populate("productId");
    res.status(200).json(savedItems);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching saved items" });
  }
});

// Add item to saved for later (Move from Bag -> SavedItem)
router.patch("/add/:itemid", async (req, res) => {
  try {
    // 1. Find the item in Bag
    const bagItem = await Bag.findById(req.params.itemid);
    if (!bagItem) {
      return res.status(404).json({ message: "Bag item not found" });
    }

    // 2. Create entry in SavedItem
    const savedItem = new SavedItem({
      userId: bagItem.userId,
      productId: bagItem.productId,
      size: bagItem.size,
      quantity: bagItem.quantity,
    });
    const savedResult = await savedItem.save();

    // 3. Remove from Bag
    await Bag.findByIdAndDelete(req.params.itemid);

    res.status(200).json(savedResult);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving item for later" });
  }
});

// Move item back to bag (Move from SavedItem -> Bag)
router.patch("/move-to-bag/:itemid", async (req, res) => {
  try {
    // 1. Find the item in SavedItem
    const savedItem = await SavedItem.findById(req.params.itemid);
    if (!savedItem) {
      return res.status(404).json({ message: "Saved item not found" });
    }

    // 2. Create entry in Bag
    const bagItem = new Bag({
      userId: savedItem.userId,
      productId: savedItem.productId,
      size: savedItem.size,
      quantity: savedItem.quantity,
      isSavedForLater: false, // Ensure it's active
    });
    const bagResult = await bagItem.save();

    // 3. Remove from SavedItem
    await SavedItem.findByIdAndDelete(req.params.itemid);

    res.status(200).json(bagResult);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error moving item to bag" });
  }
});

module.exports = router;
