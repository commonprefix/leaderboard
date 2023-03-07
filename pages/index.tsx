import { getMonthHoursByContractor, getMonthProjections } from '../lib/spreadsheet'
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
  const contractorHours: {
    [index: string]: number
  } = await getMonthHoursByContractor(year, month)
  const monthProjections = await getMonthProjections(year, month)

  return {
    props: { year, month, contractorHours, monthProjections }
  }
}

export default Leaderboard
