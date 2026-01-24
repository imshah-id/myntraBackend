const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cors = require("cors");
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("✅ Myntra backend in working");
});
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/bag", Bagroutes);
app.use("/wishlist", Wishlistroutes);
app.use("/Order", OrderRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api", recommendationRoutes);
app.use("/api/transactions", transactionRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
