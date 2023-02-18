import { getMonthHours } from '../lib/spreadsheet'
import { createHash } from 'crypto'
import Leaderboard from '../components/leaderboard'

function getCurrentDate() {
  const nowDate = new Date()

  return {
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1
  }
}

export async function getServerSideProps() {
  const { year, month } = getCurrentDate()
  let contractorHours: {
    [index: string]: number
  } = await getMonthHours(year, month)

  return {
    props: { year, month, contractorHours }
  }
}

export default Leaderboard
