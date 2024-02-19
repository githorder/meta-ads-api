require("dotenv").config();

const { loadMetaData } = require("..");
const { createRecord } = require("../../utils/gSheets");
const FBToken = require("../../models/fb-token.model");

const fields = require("./fields");
const params = require("./params");

const SHEET_ID = "17vKOaG-4jtXmLO-lAeVT3Pv7RixhZ-p9_V-2Sk3LQj4";
const SHEET_NAME = "Meta Ads Report";

async function IQWattAdsTask() {
  const accountId = process.env.IQWATT_ACC_ID;

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
        const actionConv = insight._data?.actions?.filter(
          ({ action_type }) =>
            action_type ===
            "onsite_conversion.messaging_conversation_started_7d"
        );
        const actionLeads = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "lead"
        );

        values.push([
          insight._data.campaign_name,
          insight._data.adset_name,
          insight._data.date_start,
          insight._data.age ?? "unknown",
          insight._data.gender ?? "unknown",
          Number(insight._data.spend) ?? "",
          (actionLeads && Number(actionLeads[0]?.value)) ?? "",
          (actionConv && Number(actionConv[0]?.value)) ?? "",
          (insight._data.website_ctr &&
            Number(insight._data.website_ctr[0].value)) ??
            "",
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

module.exports = IQWattAdsTask;
