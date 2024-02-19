require("dotenv").config();

const { loadMetaData } = require("..");
const { createRecord } = require("../../utils/gSheets");
const FBToken = require("../../models/fb-token.model");

const fields = require("./fields");
const params = require("./params");

const SHEET_ID = "1TYEDC2idgTfak9w6HBRIcM-P4qCVEfqLoA9--ICpqNQ";
const SHEET_NAME = "Meta Ads";

async function YDAdsTask() {
  const accountId = process.env.YD_ACC_ID;

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

module.exports = YDAdsTask;
