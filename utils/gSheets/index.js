const { google } = require("googleapis");

const keys = require("./keys.json");
const auth = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

// const SHEET_NAME = process.env.YD_SHEET_NAME;
// const SHEET_ID = process.env.YD_SHEET_ID;
// const SHEET_NAME = "test meta ads";
// const SHEET_ID = "1xuCVuuld5-AHI0MLnByJudmbpuNMEpldKFzVA6sUm3E";

async function createRecord(values, SHEET_ID, SHEET_NAME) {
  try {
    const gsapi = google.sheets({ version: "v4", auth });

    const res = await gsapi.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:R`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: values,
        range: `${SHEET_NAME}!A:R`,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function getRecords(range) {
  try {
    const gsapi = google.sheets({ version: "v4", auth });

    const records = await gsapi.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${range}`,
    });

    return records.data.values;
  } catch (err) {
    console.log("The error: ", err);
  }
}

async function appendRecord(values, range) {
  try {
    const gsapi = google.sheets({ version: "v4", auth });

    const res = await gsapi.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!${range}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
        range: `${SHEET_NAME}!${range}`,
      },
    });
  } catch (err) {
    console.log("The error: ", err);
  }
}

module.exports = { createRecord, appendRecord, getRecords };
