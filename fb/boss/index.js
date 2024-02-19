require("dotenv").config();

const { loadMetaData } = require("..");
const { createRecord } = require("../../utils/gSheets");
const FBToken = require("../../models/fb-token.model");

const fields = require("./fields");
const params = require("./params");

const SHEET_ID = "1LxXZHnqmvg0Cre89yH_2A6wXy6s9JVQ6fwGI19TaHu8";
const SHEET_NAME = "Meta Ads Report";

async function BossAdsTask() {
  const accountId = process.env.BOSS_ACC_ID;

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

module.exports = BossAdsTask;
