import * as dotenv from 'dotenv'

const DASHBOARD_ID = '1Bceo3Srq6E4X_3Xkinftt1SoitcEEiBrYbQEJFOIfk8'
const PROJECTIONS_ID = '1xJDb-7hHlNdISarFAUxWQ1JoucuMR44ZFOxYvqmNF1k'

const { google } = require('googleapis');
const sheets = google.sheets('v4')
const { promisify } = require('util')
sheets.spreadsheets.values.getAsync = promisify(sheets.spreadsheets.values.get)

type LogEntry = {
  type: string,
  customer: string,
  service: string,
  contractor: string,
  date: string,
  hours: string
}

class GoogleSpreadsheetClient {
  auth: any

  async init() {
    dotenv.config()

    if (process.env.GOOGLE_AUTH === undefined) {
      return
    }

    const credentials = JSON.parse(process.env.GOOGLE_AUTH)

    this.auth = await google.auth.getClient({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async getRange(spreadsheetId: string, range: string) {
    return (await sheets.spreadsheets.values.getAsync({
      auth: this.auth,
      spreadsheetId,
      range,
    })).data.values
  }
}

export async function getMonthProjections(year: number, month: number): Promise<{ [index: string ]: number }> {
  const ret: { [ index: string ]: number } = {}
  const client = new GoogleSpreadsheetClient()
  await client.init()

  let projections: [string, string][] = []

  try {
    projections = await client.getRange(PROJECTIONS_ID, `'${year}-${('0' + month).slice(-2)}'!A2:B`)
  }
  catch {
    return ret
  }

  for (const projection of projections) {
    const [contractor, hours] = projection

    if (contractor === undefined || hours === undefined || hours == '0') {
      continue
    }
    ret[contractor] = parseFloat(hours)
  }

  return ret
}

export async function getLog(): Promise<LogEntry[]> {
  const client = new GoogleSpreadsheetClient()
  await client.init()

  const log = await client.getRange(DASHBOARD_ID, `'time'!A1:F`)

  return log.map(
    ([type, customer, service, contractor, date, hours]: string[]): LogEntry =>
    ({type, customer, service, contractor, date, hours})
  ).filter(({type, customer, service, contractor, date, hours}: LogEntry) => {
    return date !== undefined
        && date.trim() !== ''
        && contractor.trim() !== ''
        && !isNaN(parseFloat(hours))
        && parseFloat(hours) !== 0
  })
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

function filterLogByDate(desiredYear: number, desiredMonth: number) {
  return (entry: LogEntry): boolean => {
    const {month, year} = parseDate(entry.date)

    return year == desiredYear && month == desiredMonth
  }
}

function filterLogByContractor(desiredContractor: string) {
  return (entry: LogEntry) => entry.contractor == desiredContractor
}

export async function getMonthHours(year: number, month: number): Promise<{ [index: string]: number }> {
  let log = await getLog()
  const contractors: {[index: string]: number} = {}

  log = log.filter(filterLogByDate(year, month))

  for (const entry of log) {
    const {contractor, hours} = entry

    if (contractors[contractor] === undefined) {
      contractors[contractor] = 0
    }
    contractors[contractor] += parseFloat(hours)
  }

  return contractors
}
