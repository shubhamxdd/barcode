const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// Load Google Sheets credentials
const credentials = require('../config/ google_credentials.json');

// Configure the JWT client
const client = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Google Sheet ID and sheet names
const SPREADSHEET_ID = '1CF9ZBxHHWd7F9YXG9gILgbshsIdfykuFO-9-D0F_8zo';
const SOURCE_SHEET_NAME = 'Sheet1';
const HISTORY_SHEET_NAME = 'history';

// Function to transfer data from Sheet1 to history and clear Sheet1
const transferAndClearSheet = async () => {
  console.log('Called transferAndClearSheet');
  try {
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Fetch data from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOURCE_SHEET_NAME}!A:F`,
    });

    const rows = response.data.values;

    if (rows.length === 0) {
      console.log('No data found in Sheet1.');
      return;
    }

    // Append data to history sheet
    if (rows.length > 1) { // Ensure there's data beyond the header
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${HISTORY_SHEET_NAME}!A:F`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: rows,
        },
      });
      console.log('Data appended to history sheet.');
    }

    // Clear data in Sheet1
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SOURCE_SHEET_NAME}!A:F`,
    });
    console.log('Sheet1 cleared.');
  } catch (error) {
    console.error('Error transferring data or clearing the sheet', error);
  }
};

module.exports = {
  transferAndClearSheet,
};
