'use strict';

const SPREADSHEET_ID = '1Z04tzlkR5i0eHfm23XHbjR-GZdDNAR8QfPSezGwuhpE'

const { google } = require('googleapis')
const sheets = google.sheets('v4')
const { promisify } = require('util')
sheets.spreadsheets.values.getAsync = promisify(sheets.spreadsheets.values.get)
sheets.spreadsheets.values.updateAsync = promisify(sheets.spreadsheets.values.update)

async function getCurrentMonthHours() {
  const auth = await google.auth.getClient({
    credentials: require('./credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  // google.options({ auth })

  function getDateString(date) {
    return date.toISOString().split('T')[0]
  }

  const date = new Date()
  const firstDay = getDateString(new Date(date.getFullYear(), date.getMonth(), 1))
  const lastDay = getDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0))

  await sheets.spreadsheets.values.updateAsync({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Contractors!B2:C2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[firstDay, lastDay]]
    }
  })

  const res = await sheets.spreadsheets.values.getAsync({
    auth,
    spreadsheetId: SPREADSHEET_ID,
    range: 'Contractors!A2:H',
  })
  const rows = res.data.values;

  const contractors = []

  for (const row of rows) {
    if (typeof row[0] === 'undefined') {
      break
    }
    contractors.push({
      name: row[0],
      hours: row[7] - 0
    })
  }

  return contractors
}

module.exports = { getCurrentMonthHours }
