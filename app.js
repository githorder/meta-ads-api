require("dotenv").config();

const cronJob = require("node-cron");

const AGAdsTask = require("./fb/agency");
const YDAdsTask = require("./fb/yd");

const metaAdsScheduler = cronJob.schedule(
  "0 23 * * *",
  () => {
    AGAdsTask();
    YDAdsTask();
  },
  { timezone: "Asia/Tashkent" }
);

metaAdsScheduler.start();
