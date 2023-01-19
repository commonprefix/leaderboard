const SPREADSHEET_ID = '1Bceo3Srq6E4X_3Xkinftt1SoitcEEiBrYbQEJFOIfk8'

const { google } = require('googleapis');
const sheets = google.sheets('v4')
const { promisify } = require('util')
sheets.spreadsheets.values.getAsync = promisify(sheets.spreadsheets.values.get)

export async function getCurrentMonthHours(): Promise<{ [index: string]: number }> {
  const auth = await google.auth.getClient({
    credentials: require('./credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const nowDate = new Date()

  async function getRange(range: string) {
    return (await sheets.spreadsheets.values.getAsync({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range,
    })).data.values
  }

  function parseDate(dateString: string) {
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

  let log = await getRange(`'time'!A1:F`)
  const contractors: {[index: string]: number} = {}

  for (const entry of log) {
    const [type, customer, service, contractor, date, hours] = entry

    if (date === undefined
    || date.trim() == ''
    || contractor.trim() == ''
    || parseFloat(contractor.hours) == 0) {
      continue
    }
    const {month, year} = parseDate(date)

    if (year == nowDate.getFullYear() && month == nowDate.getMonth() + 1) {
      if (contractors[contractor] === undefined) {
        contractors[contractor] = 0
      }
      if (isNaN(parseFloat(hours))) {
        continue
      }
      contractors[contractor] += parseFloat(hours)
    }
  }

  return contractors
}
