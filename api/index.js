const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const userInfoRoutes = require("../routes/userInfoRoutes");
const referralRoutes = require("../routes/referralRoutes");

const startBot = require("../bots/bot"); //tg bot run here

dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: ["https://tg_referral_system_ciz.vercel.app"],
  })
);
app.use(express.json());

// Register  API routes
app.use("/api/user-info", userInfoRoutes);
app.use("/api/referrals", referralRoutes);

// Start the bot and its webhook
startBot(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
