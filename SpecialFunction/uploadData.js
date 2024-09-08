const { google } = require('googleapis');
const { JWT } = require('google-auth-library');
const moment = require('moment'); // For handling timestamps
const Product = require('../Models/Product'); // Your Product model
const Inventory = require('../Models/Inventory'); // Your Inventory model

// Load Google Sheets credentials
const credentials = require('../config/ google_credentials.json');

// Configure the JWT client
const client = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

// Google Sheet ID and range
const SPREADSHEET_ID = '1CF9ZBxHHWd7F9YXG9gILgbshsIdfykuFO-9-D0F_8zo';
const SHEET_NAME = 'Sheet1';
// Function to fetch data from Google Sheets and update MongoDB
const updateMongoDBFromSheet = async () => {
    console.log("called");
  try {
    // Create an instance of Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Fetch data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });

    const rows = response.data.values;
    
    if (rows.length === 0) {
      console.log('No data found.');
      return;
    }

    // Process each row
    for (const row of rows.slice(1)) { // Skip header row if present
      const [username, productName, barcode, quantity, isAdded, timestamp] = row;

      if (isAdded === 'ok' && moment().diff(moment(timestamp), 'hours') <= 24) {
        // Find or create the product
        let product = await Product.findOne({ barcode });

        if (!product) {
          // Assuming there's a Product model method to create a new product
          product = await Product.create({ barcode, productName });
        }
 
        // Add to inventory
        let inventory = await Inventory.findOne({ product: product._id, establishment: 'SomeEstablishment' });

        if (inventory) {
          inventory.quantity += parseInt(quantity, 10);
          inventory.remarks = inventory.remarks || 'Automatically updated';
        } else {
          inventory = new Inventory({
            product: product._id,
            quantity: parseInt(quantity, 10),
            remarks: 'Automatically updated',
            establishment: 'SomeEstablishment',
          });
        }

        await inventory.save();
        console.log(`Inventory updated for product ${productName} (Barcode: ${barcode})`);
      }
    }
  } catch (error) {
    console.error('Error fetching data from Google Sheets or updating MongoDB', error);
  }
};

module.exports = {
  updateMongoDBFromSheet,
};
