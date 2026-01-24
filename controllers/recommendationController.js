const BrowsingHistory = require("../models/BrowsingHistory");
const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

exports.recordHistory = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing userId or productId" });
  }

  try {
    // Upsert the history to update the timestamp if already viewed
    await BrowsingHistory.findOneAndUpdate(
      { userId, productId },
      { viewedAt: new Date() },
      { upsert: true, new: true },
    );
    res.status(200).json({ success: true, message: "View recorded" });
  } catch (error) {
    console.error("Error recording history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getRecommendations = async (req, res) => {
  const { userId, currentProductId } = req.query;

  try {
    let recommendations = [];
    const excludeIds = [];

    if (currentProductId) {
      excludeIds.push(new mongoose.Types.ObjectId(currentProductId));

      // 1. Content-Based Filtering (Simpler approach: Same Category)
      // Find category of the current product
      const category = await Category.findOne({ productId: currentProductId });

      if (category) {
        // Fetch products from the same category, excluding the current one
        // Limit to 6 to leave room for history-based
        const categoryProducts = await Product.find({
          _id: { $in: category.productId, $nin: excludeIds },
        }).limit(6);

        recommendations.push(...categoryProducts);
        // Add these to exclude list so we don't pick them again
        categoryProducts.forEach((p) => excludeIds.push(p._id));
      }

      // 1b. Brand based (if needed, but Category is usually stronger signal for "You may also like")
      // If we have less than 4 items, let's look for same brand across valid categories?
      // Simplified: Just stick to Category for "similar items" for now as per prompt.
    }

    // 2. Collaborative/History Based: "Because you viewed..."
    // If not enough recommendations, fill with items similar to user's recent history
    if (userId && recommendations.length < 10) {
      const recentViews = await BrowsingHistory.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(5)
        .populate("productId");

      // Extract categories/brands from history?
      // For MVP, simply suggesting the recently viewed items themselves is a "Recently Viewed" feature.
      // The prompt asks for "recommendations based ... on user's browsing behavior".
      // A common technique: Find items in categories of recently viewed items.

      const viewedProductIds = recentViews
        .map((h) => h.productId?._id)
        .filter((id) => id); // filter nulls

      // Avoid recommending things they JUST saw if we want "discovery", but often "Recently Viewed" is what is wanted.
      // Let's assume we want NEW things. So find categories of these viewed products.

      for (const historyItem of recentViews) {
        if (recommendations.length >= 10) break;

        if (!historyItem.productId) continue;

        const cat = await Category.findOne({
          productId: historyItem.productId._id,
        });
        if (cat) {
          const productsInCat = await Product.find({
            _id: { $in: cat.productId, $nin: excludeIds },
          }).limit(2); // take 2 from each recent category

          for (const p of productsInCat) {
            if (recommendations.length >= 10) break;
            recommendations.push(p);
            excludeIds.push(p._id);
          }
        }
      }
    }

    // Fill with random products if still empty (Popularity fallback)
    if (recommendations.length < 4) {
      const randomProducts = await Product.find({
        _id: { $nin: excludeIds },
      }).limit(10 - recommendations.length);
      recommendations.push(...randomProducts);
    }

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
