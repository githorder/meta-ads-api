const { setTimeout: sleep } = require("node:timers/promises");

const bizSdk = require("facebook-nodejs-business-sdk");

const { createRecord } = require("./gSheets");

const AdAccount = bizSdk.AdAccount;
const Ad = bizSdk.Ad;
const Campaign = bizSdk.Campaign;
const Insights = bizSdk.InsightsResult;
const AdSet = bizSdk.AdSet;
const AdReportRun = bizSdk.AdReportRun;

const accessToken =
  "EAAHXvke4wn4BO4mgotzegGFZAorAgFK4BB8MwzFPcvU5iNc8OiyOGskcVbFQq1HENZCLkiGMiGWMpCqHDPDjhr1kCA14FlUiuosEtdbAu7Bw997yGDKZBYfZCMQp8i4nSaa3NFU9qgv4yVBFLnsQNOXALYNshcHfjAzN5SxevQUNKJy2tVinmIZBZBDczflN0tAOCZAGo5MybiXr0nmWo8vaduyUFOZB";
const accountId = "act_473357418251469";

bizSdk.FacebookAdsApi.init(accessToken);

const account = new AdAccount(accountId);

const params = {
  breakdowns: "age, gender",
  date_preset: "last_month",
  time_increment: 1,
  action_attribution_windows: ["1d_click", "7d_click", "1d_view"],
};

const fields = [
  "campaign_name",
  "adset_name",
  "spend",
  "impressions",
  "reach",
  "frequency",
  "inline_link_clicks",
  "cost_per_inline_link_click",
  "website_ctr",
  "actions",
  "cost_per_action_type",
];

(async function () {
  const adSets = await account.getAdSets([], {});
  const adSetIds = [];

  for (const adSet of adSets) {
    adSetIds.push(adSet._data.id);
  }

  for (let i = 0; i < adSetIds.length; i++) {
    let insights = await new AdSet(adSetIds[i]).getInsights(fields, params);
    let notEmpty = true;

    let j = 0;
    while (notEmpty) {
      for (const insight of insights) {
        const action = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "landing_page_view"
        );
        const costAction = insight._data?.cost_per_action_type?.filter(
          ({ action_type }) => action_type === "landing_page_view"
        );

        await createRecord([
          insight._data.campaign_name,
          insight._data.adset_name,
          insight._data.date_start,
          insight._data.age ?? "unknown",
          insight._data.gender ?? "unknown",
          insight._data.spend ?? "-",
          "Просмотры целевой страницы",
          (action && action[0]?.value) ?? "-",
          (costAction && costAction[0]?.value) ?? "-",
          insight._data.inline_link_clicks ?? "-",
          insight._data.cost_per_inline_link_click ?? "-",
          (insight._data.website_ctr && insight._data.website_ctr[0].value) ??
            "-",
          insight._data.reach ?? "-",
          insight._data.impressions ?? "-",
          insight._data.frequency ?? "-",
          (action && action[0]?.value) ?? "-",
          (costAction && costAction[0]?.value) ?? "-",
          insight._data.date_start,
          insight._data.date_start,
        ]);
      }

      notEmpty = insights.hasNext();
      
      if (notEmpty) {
        await sleep(1000);
        insights = await insights.next();
      } else {
        break;
      }
    }
  }
})();
