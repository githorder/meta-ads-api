require("dotenv").config();

const cronJob = require("node-cron");

const AGAdsTask = require("./fb/agency");
const YDAdsTask = require("./fb/yd");
const BentoAdsTask = require("./fb/bento");
const BossAdsTask = require("./fb/boss");
const BPAdsTask = require("./fb/bp");
const IQWattAdsTask = require("./fb/iqwatt");
const PGAdsTask = require("./fb/pg");
const SolarAdsTask = require("./fb/solar");

require("./models/fb-token.model");

const sequelize = require("./utils/db");

async function startup() {
  try {
    await sequelize.sync({});

    const metaAdsScheduler = cronJob.schedule(
      "0 23 * * *",
      () => {
        AGAdsTask();
        YDAdsTask();
        BentoAdsTask();
        BossAdsTask();
        BPAdsTask();
        PGAdsTask();
        IQWattAdsTask();
        SolarAdsTask();
      },
      { timezone: "Asia/Tashkent", s }
    );

    metaAdsScheduler.start();

    console.log("The server is listening...");
  } catch (err) {
    console.log("Failed to start the server", err);
  }
}

startup();
