require("dotenv").config();

const { setTimeout: sleep } = require("node:timers/promises");

const bizSdk = require("facebook-nodejs-business-sdk");

const { createRecord, appendRecord, getRecords } = require("./gSheets");

const AdAccount = bizSdk.AdAccount;
const AdReportRun = bizSdk.AdReportRun;

const accessToken = process.env.ACCESS_TOKEN;
const accountId = process.env.YD_ACC_ID;

bizSdk.FacebookAdsApi.init(accessToken);

const account = new AdAccount(accountId);

const params = {
  breakdowns: "age, gender",
  // date_preset: "this_year",
  time_range: { since: "2023-04-01", until: "2024-01-17" },
  time_increment: 1,
  action_attribution_windows: ["7d_click", "1d_click", "1d_view"],
  sort: ["date_start_ascending"],
  level: "adset",
};

const fields = [
  "campaign_name",
  "adset_name",
  "spend",
  "impressions",
  "frequency",
  "inline_link_clicks",
  "cost_per_inline_link_click",
  "website_ctr",
  "actions",
  "cost_per_action_type",
];

const SHEET_ID = "1xuCVuuld5-AHI0MLnByJudmbpuNMEpldKFzVA6sUm3E";
const SHEET_NAME = "test meta ads (yd)";

async function loadMetaData() {
  try {
    let async_job = await account.getInsightsAsync(fields, params);

    async_job = await async_job.get();

    console.log(async_job);

    const values = [];

    while (async_job[AdReportRun.Fields.async_status] !== "Job Completed") {
      await sleep(1000);
      async_job = await async_job.get();
      console.log(async_job);
    }

    console.log("Completed...");

    let insights = await async_job.getInsights([], {});

    let notEmpty = true;

    let i = 1;

    while (notEmpty) {
      for (let insight of insights) {
        const actionClicks = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "link_click"
        );
        const actionViews = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "landing_page_view"
        );
        const actionEngagement = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "post_engagement"
        );
        const actionPurchase = insight._data?.actions?.filter(
          ({ action_type }) =>
            action_type === "offsite_conversion.fb_pixel_purchase"
        );

        console.log(insight._data?.actions);

        values.push([
          insight._data.campaign_name,
          insight._data.adset_name,
          insight._data.date_start,
          insight._data.age ?? "unknown",
          insight._data.gender ?? "unknown",
          Number(insight._data.spend) ?? "",
          (actionPurchase && Number(actionPurchase[0]?.value)) ?? "",
          (actionClicks && Number(actionClicks[0]?.value)) ?? "",
          (insight._data.website_ctr &&
            Number(insight._data.website_ctr[0].value)) ??
            "",
          Number(insight._data.impressions) ?? "",
          Number(insight._data.frequency) ?? "",
          (actionViews && Number(actionViews[0]?.value)) ?? "",
          (actionEngagement && Number(actionEngagement[0]?.value)) ?? "",
        ]);

        // console.log(i);
        i++;
      }

      notEmpty = insights.hasNext();

      if (notEmpty) {
        insights = await insights.next();
      } else {
        break;
      }
    }

    createRecord(values, SHEET_ID, SHEET_NAME);
  } catch (error) {
    console.log("Error: ", error);
  }
}

async function importAmountsFromMeta(fields, params) {
  let amounts_spent = 0;

  try {
    let async_job = await account.getInsightsAsync(fields, params);

    async_job = await async_job.get();

    console.log(async_job);

    while (async_job[AdReportRun.Fields.async_status] !== "Job Completed") {
      await sleep(1000);
      async_job = await async_job.get();
      console.log(async_job);
    }

    console.log("Completed...");

    let insights = await async_job.getInsights([], {});

    for (let insight of insights) {
      amounts_spent += Number(insight._data.spend);
    }

    console.log(amounts_spent);

    const records = await getRecords("B:B");

    await appendRecord(
      [`${amounts_spent}$`],
      `B${records.length + 1}:B${records.length + 1}`
    );
    console.log("done");
  } catch (err) {
    console.log("The error: ", err);
  }
}

loadMetaData();
