'use strict';

const SPREADSHEET_ID = '1Z04tzlkR5i0eHfm23XHbjR-GZdDNAR8QfPSezGwuhpE'

const { google } = require('googleapis');
const sheets = google.sheets('v4')
const { promisify } = require('util')
sheets.spreadsheets.values.getAsync = promisify(sheets.spreadsheets.values.get)

async function getCurrentMonthHours() {
  const auth = await google.auth.getClient({
    credentials: require('./credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const nowDate = new Date()

  async function getRange(range) {
    return (await sheets.spreadsheets.values.getAsync({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range,
    })).data.values
  }

  const contractorNames = (await getRange('Contractors!A2:A')).flat()

  function parseDate(dateString) {
    let day, month, year

    if (dateString.indexOf('-') != -1) {
      const [a, b, c] = dateString.split('-')
      if (a.length == 4) {
        [year, month, day] = [a, b, c]
      }
      else {
        [day, month, year] = [a, b, c]
      }
    }
    else {
      [day, month, year] = dateString.split('/')
    }
    year = parseInt(year)
    month = parseInt(month)

    return {month, year}
  }

  let logPromises = contractorNames.map(async name => {
    let log = await getRange(`'${name} Hours'!B2:C`)
    let hours = 0

    for (const entry of log) {
      if (entry.length >= 2) {
        const [logHours, logDate] = entry
        const {month, year} = parseDate(logDate)

        if (year == nowDate.getFullYear() && month == nowDate.getMonth() + 1) {
          hours += parseFloat(logHours)
        }
      }
    }

    return {
      name,
      hours: Math.round(100 * hours) / 100
    }
  })

  return await Promise.all(logPromises)
}

module.exports = { getCurrentMonthHours }
