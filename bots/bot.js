const { Telegraf } = require("telegraf");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const cleanAndLimitFirstName = (firstName) => {
  if (!firstName) return "Unknown";
  return firstName.replace(/[^a-zA-Z0-9]/g, "").substring(0, 8) || "Unknown";
};

bot.start(async (ctx) => {
  const referrerID = ctx.startPayload;
  const tgUserID = ctx.from.id.toString();

  const tgUsername =
    ctx.from.username && ctx.from.username.trim() !== ""
      ? ctx.from.username
      : cleanAndLimitFirstName(ctx.from.first_name); // Clean and limit first name if username is not available

  const isPremium = ctx.from.is_premium ? true : false;

  console.log("Received Telegram data:", {
    tgUserID,
    tgUsername,
    isPremium,
    referrerID,
  });

  if (!referrerID) {
    await sendWelcomeMessage(ctx);
    return;
  }

  try {
    const userResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/user-info/${tgUserID}`
    );

    if (!userResponse.data) {
      await registerReferral(referrerID, tgUserID, tgUsername, isPremium);
    } else {
      console.log(`User already exists: ${tgUserID}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await registerReferral(referrerID, tgUserID, tgUsername, isPremium);
    } else {
      console.error("Error during referral processing:", error);
    }
  }

  await sendWelcomeMessage(ctx);
});
