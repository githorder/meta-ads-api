const { google } = require("googleapis");

const keys = require("./keys.json");
const auth = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const SHEET_NAME = process.env.SHEET_NAME;
const SHEET_ID = process.env.SHEET_ID;

async function createRecord(values) {
  try {
    const gsapi = google.sheets({ version: "v4", auth });

    const res = await gsapi.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:R`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
        range: `${SHEET_NAME}!A:R`,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { createRecord };
