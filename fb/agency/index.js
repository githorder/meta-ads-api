require("dotenv").config();

const { loadMetaData } = require("..");
const { createRecord } = require("../../utils/gSheets");
const FBToken = require("../../models/fb-token.model");

const fields = require("./fields");
const params = require("./params");

// const SHEET_ID = "1xuCVuuld5-AHI0MLnByJudmbpuNMEpldKFzVA6sUm3E";
// const SHEET_NAME = "test meta ads (ag)";

const SHEET_ID = "1se6b4APnr35M82_jJuutVhfR5lS0GqdEpaMAGj-CZoI";
const SHEET_NAME = "Meta ADS";

async function AGAdsTask() {
  const accountId = process.env.AGENCY_ACC_ID;

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
            action_type === "offsite_conversion.fb_pixel_custom"
        );
        const actionClicks = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "link_click"
        );
        const actionViews = insight._data?.actions?.filter(
          ({ action_type }) => action_type === "landing_page_view"
        );

        values.push([
          insight._data.campaign_name,
          insight._data.adset_name,
          insight._data.date_start,
          insight._data.age ?? "unknown",
          insight._data.gender ?? "unknown",
          Number(insight._data.spend) ?? "",
          (actionConv && Number(actionConv[0]?.value)) ?? "",
          (actionClicks && Number(actionClicks[0]?.value)) ?? "",
          (insight._data.website_ctr &&
            Number(insight._data.website_ctr[0].value)) ??
            "",
          Number(insight._data.impressions) ?? "",
          Number(insight._data.frequency) ?? "",
          (actionViews && Number(actionViews[0]?.value)) ?? "",
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

module.exports = AGAdsTask;
