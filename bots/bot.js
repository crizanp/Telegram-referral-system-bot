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

const sendWelcomeMessage = async (ctx) => {
  await ctx.reply(
    `
  🚀 **Welcome bro to the tg mini apps development connect with me @cizanp** 🚀

      `,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🎮 Launch Mini App",
              web_app: { url: "https://referral_system_ciz.vercel.app" },
            },
          ],
          [{ text: "Subscribe Channel", url: "https://t.me/cizantg" }],
        ],
      },
    }
  );
};
const registerReferral = async (
  referrerID,
  tgUserID,
  tgUsername,
  isPremium
) => {
  try {
    console.log(
      `Registering referral for new user with username: ${tgUsername}`
    );
    await axios.put(
      `${process.env.BACKEND_URL}/api/referrals/register/${referrerID}`,
      {
        referredID: tgUserID,
        isPremium: isPremium,
        username: tgUsername,
      }
    );
    console.log(
      `Referral registered successfully for referrerID: ${referrerID}, referredID: ${tgUserID}`
    );
  } catch (error) {
    console.error("Error processing referral:", error);
  }
};
// Start the bot with webhook setup

const startBot = async (app) => {
  try {
    const webhookInfo = await bot.telegram.getWebhookInfo();
    if (!webhookInfo.url) {
      await bot.telegram.setWebhook(
        `${process.env.WEBHOOK_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`
      );
      console.log("Webhook set successfully.");
    }

    app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
      bot.handleUpdate(req.body, res);
    });

    console.log("Bot is running and webhook is set.");
  } catch (error) {
    console.error("Error setting up webhook:", error.message || error);
  }
};
module.exports = startBot;
