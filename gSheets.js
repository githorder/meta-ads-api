const { google } = require("googleapis");

const keys = require("./keys.json");
const auth = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  "https://www.googleapis.com/auth/spreadsheets",
]);

const SHEET_NAME = "Meta ads report";
const SHEET_ID = "1B95wJDUo3hmDlsUsX_PIAB01Ddac2hF1GR23XQSEV6s";

async function createRecord(values) {
  try {
    const gsapi = google.sheets({ version: "v4", auth });

    const res = await gsapi.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A:S`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
        range: `${SHEET_NAME}!A:S`,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { createRecord };
