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
  "EAAHXvke4wn4BOZBuOGBSYeJN1vANaMDVmkkVg0riODVN6XkeHt6XPpFRT1opZBy88DnRz43zo454icHweD6hYxd1zgIgW5qHf6OFntKBnN1lELgmEZA0OIHZBV36puiMih0d8DgvgnZAqDooCyulOQYMLRHESx9PRdZAbhmFZB3z1xImt1HMZB6qySYtQuSpVzUd5mNlAFIzxWxg8kMIrU2mryXX9ZBIZD";
const accountId = "act_473357418251469";

bizSdk.FacebookAdsApi.init(accessToken);

const account = new AdAccount(accountId);

const params = {
  breakdowns: "age, gender",
  // date_preset: "last_month",
  date_preset: "last_week_mon_sun",
  time_increment: 1,
  action_attribution_windows: ["1d_click", "7d_click", "1d_view"],
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

(async function () {
  let insights = await account.getInsights(fields, params);

  let notEmpty = true;

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
})();

// version without sorting

// (async function () {
//   const adSets = await account.getAdSets([], {});
//   const adSetIds = [];

//   for (const adSet of adSets) {
//     adSetIds.push(adSet._data.id);
//   }

//   for (let i = 0; i < adSetIds.length; i++) {
//     let insights = await new AdSet(adSetIds[i]).getInsights(fields, params);
//     let notEmpty = true;

//     let j = 0;
//     while (notEmpty) {
//       for (const insight of insights) {
//         const action = insight._data?.actions?.filter(
//           ({ action_type }) => action_type === "landing_page_view"
//         );
//         const costAction = insight._data?.cost_per_action_type?.filter(
//           ({ action_type }) => action_type === "landing_page_view"
//         );

//         console.log(insight._data);

//         await createRecord([
//           insight._data.campaign_name,
//           insight._data.adset_name,
//           insight._data.date_start,
//           insight._data.age ?? "unknown",
//           insight._data.gender ?? "unknown",
//           insight._data.spend ?? "-",
//           "Просмотры целевой страницы",
//           (action && action[0]?.value) ?? "-",
//           (costAction && costAction[0]?.value) ?? "-",
//           insight._data.inline_link_clicks ?? "-",
//           insight._data.cost_per_inline_link_click ?? "-",
//           (insight._data.website_ctr && insight._data.website_ctr[0].value) ??
//             "-",
//           insight._data.impressions ?? "-",
//           insight._data.frequency ?? "-",
//           (action && action[0]?.value) ?? "-",
//           (costAction && costAction[0]?.value) ?? "-",
//           insight._data.date_start,
//           insight._data.date_start,
//         ]);
//       }

//       notEmpty = insights.hasNext();

//       if (notEmpty) {
//         await sleep(1000);
//         insights = await insights.next();
//       } else {
//         break;
//       }
//     }
//   }
// })();
