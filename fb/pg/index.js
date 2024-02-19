require("dotenv").config();

const { loadMetaData } = require("..");
const { createRecord } = require("../../utils/gSheets");
const FBToken = require("../../models/fb-token.model");

const fields = require("./fields");
const params = require("./params");

const SHEET_ID = "1-jas79rKVajBPQ55lFWL_KxXqp9pugwsGm7KYMUAFB4";
const SHEET_NAME = "PG Meta Ads (2024)";

async function PGAdsTask() {
  const accountId = process.env.PG_ACC_ID;

  try {
    const accessToken = await FBToken.findOne({ where: { name: "pg" } });

    let insights = await loadMetaData({
      accountId,
      accessToken,
      fields,
      params: {
        ...params,
        time_range: {
          since: `${new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - 1
          ).toLocaleDateString()} 00:00:00`,
          until: `${new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - 1
          ).toLocaleDateString()} 23:59:59`,
        },
      },
    });

    const values = [];
    let notEmpty = true;

    let i = 1;

    while (notEmpty) {
      for (let insight of insights) {
        const actionPostEng = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "post_engagement"
        );
        const actionClicks = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "link_click"
        );

        values.push([
          insight._data.campaign_name,
          insight._data.adset_name,
          insight._data.date_start,
          insight._data.age ?? "unknown",
          insight._data.gender ?? "unknown",
          Number(insight._data.spend) ?? "",
          (actionPostEng && Number(actionPostEng[0]?.value)) ?? "",
          (actionClicks && Number(actionClicks[0]?.value)) ?? "",
          (insight._data.website_ctr &&
            Number(insight._data.website_ctr[0].value)) ??
            "",
          Number(insight._data.reach) ?? "",
          Number(insight._data.impressions) ?? "",
          Number(insight._data.frequency) ?? "",
        ]);

        // console.log(i);
        // i++;
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

module.exports = PGAdsTask;
