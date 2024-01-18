require("dotenv").config();

const { setTimeout: sleep } = require("node:timers/promises");

const bizSdk = require("facebook-nodejs-business-sdk");

async function loadMetaData({ accessToken, accountId, fields, params }) {
  const AdAccount = bizSdk.AdAccount;
  const AdReportRun = bizSdk.AdReportRun;

  bizSdk.FacebookAdsApi.init(accessToken);
  const account = new AdAccount(accountId);

  try {
    let async_job = await account.getInsightsAsync(fields, params);

    async_job = await async_job.get();

    // console.log(async_job);

    while (async_job[AdReportRun.Fields.async_status] !== "Job Completed") {
      await sleep(1000);
      async_job = await async_job.get();
      // console.log(async_job);
    }

    console.log("Completed...");

    let insights = await async_job.getInsights([], {});
    return insights;
  } catch (error) {
    console.log("Error: ", error);
  }
}

async function importAmountsFromMeta(fields, params) {
  let amounts_spent = 0;

  try {
    let async_job = await account.getInsightsAsync(fields, params);

    async_job = await async_job.get();

    // console.log(async_job);

    while (async_job[AdReportRun.Fields.async_status] !== "Job Completed") {
      await sleep(1000);
      async_job = await async_job.get();
      // console.log(async_job);
    }

    console.log("Completed...");

    let insights = await async_job.getInsights([], {});

    for (let insight of insights) {
      amounts_spent += Number(insight._data.spend);
    }

    // console.log(amounts_spent);
    return amounts_spent;
  } catch (err) {
    console.log("The error: ", err);
  }
}

module.exports = { loadMetaData, importAmountsFromMeta };
