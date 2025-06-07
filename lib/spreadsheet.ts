import * as dotenv from 'dotenv'
import { redis } from './redis';

const HOUR_LOGS_ID = '1Z04tzlkR5i0eHfm23XHbjR-GZdDNAR8QfPSezGwuhpE'
const PROJECTIONS_ID = '1xJDb-7hHlNdISarFAUxWQ1JoucuMR44ZFOxYvqmNF1k'

const { google } = require('googleapis');
const sheets = google.sheets('v4')
const { promisify } = require('util')
sheets.spreadsheets.values.getAsync = promisify(sheets.spreadsheets.values.get)

type LogEntry = {
  customer: string,
  service: string,
  contractor: string,
  date: string,
  hours: string
}

export type LoggedHours = {
  total: number,
  billable: number,
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

  async getRanges(spreadsheetId: string, ranges: string[]) {
    return (await sheets.spreadsheets.values.batchGet({
      auth: this.auth,
      spreadsheetId,
      ranges
    })).data.valueRanges
  }
}

export async function getMonthProjections(year: number, month: number): Promise<{ [index: string ]: number }> {
  const ret: { [ index: string ]: number } = {}
  const client = new GoogleSpreadsheetClient()
  await client.init()

  let projections: [string, string][] = []

  try {
    projections = await client.getRanges(PROJECTIONS_ID, [`'${year}-${('0' + month).slice(-2)}'!A2:B`])
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

  let [hour_logs, last_updated] = await client.getRanges(HOUR_LOGS_ID, [`'All'!B1:F`, `'All'!P2`])

  try {
    if (!last_updated.values || last_updated.values[0][0] === "") {
      hour_logs = await redis.get<any>('data');
      console.log("Using old data")
    }
  } catch (error) {
    console.error("error fetching old data", error)
  }

  await redis.set('data', hour_logs);

  return hour_logs.values.map(
    ([customer, service, contractor, date, hours]: string[]): LogEntry =>
    ({customer, service, contractor, date, hours})
  ).filter(({customer, service, contractor, date, hours}: LogEntry) => {
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

  return { month, year }
}

function filterLogByDate(desiredYear: number, desiredMonth: number) {
  return (entry: LogEntry): boolean => {
    const { month, year } = parseDate(entry.date)

    return year == desiredYear && month == desiredMonth
  }
}

function filterLogByContractor(desiredContractor: string) {
  return (entry: LogEntry) => entry.contractor == desiredContractor
}

export async function getMonthHoursByContractor(year: number, month: number): Promise<{ [index: string]: LoggedHours }> {
  let log = await getLog()
  const contractors: {[index: string]: LoggedHours} = {}

  log = log.filter(filterLogByDate(year, month))

  for (const entry of log) {
    const {contractor, hours, customer} = entry

    if (contractors[contractor] === undefined) {
      contractors[contractor] = { total: 0, billable: 0 }
    }
    contractors[contractor].total += parseFloat(hours)

    if (customer !== "Common Prefix") {
      contractors[contractor].billable += parseFloat(hours)
    }
  }

  return contractors
}

export async function getContractorHoursByMonth(contractor: string):
  Promise<[number, number, number][]> {
  let log = await getLog()
  let ret: [number, number, number][] = []

  log = log.filter(filterLogByContractor(contractor))

  const dict: { [year: string]: { [month: string]: number } } = {}

  for (const { date, hours } of log) {
    const { month, year } = parseDate(date)

    if (dict[year] === undefined) {
      dict[year] = {}
    }
    if (dict[year][month] === undefined) {
      dict[year][month] = 0
    }
    dict[year][month] += parseFloat(hours)
  }

  for (const year in dict) {
    for (const month in dict[year]) {
      ret.push([parseInt(year), parseInt(month), dict[year][month]])
    }
  }

  ret = ret.sort(([year1, month1], [year2, month2]) => {
    if (year1 == year2) {
      return month1 - month2
    }
    return year1 - year2
  })

  return ret
}
