require("dotenv").config();

const { default: axios } = require("axios");
const cronJob = require("node-cron");

const { BASE_URL } = require("./utils/const");
const FBToken = require("./models/fb-token.model");

async function updateFBToken({ client_name, app_id, app_secret }) {
  const fbToken = await FBToken.findOne({ where: { name: client_name } });

  try {
    const { data } = await axios.post(BASE_URL, {
      grant_type: "fb_exchange_token",
      client_id: app_id,
      client_secret: app_secret,
      fb_exchange_token: fbToken.token,
    });

    FBToken.update(
      { access_token: data.access_token, expires: data.expires_in },
      { where: { name: client_name } }
    );

    console.log(`The access token for ${client_name} is updated successfully`);
  } catch (err) {
    throw new Error(`Failed to update fb token (${client_name}): ${err}`);
  }
}

function updateFBTokens() {
  cronJob.schedule("0 23 */7 * *", async () => {
    try {
      updateFBToken({
        client_name: "pg",
        app_id: process.env.APP_ID,
        app_secret: process.env.APP_SECRET,
      });
    } catch (err) {
      console.log(err.message);
    }
  });
}

updateFBTokens();
