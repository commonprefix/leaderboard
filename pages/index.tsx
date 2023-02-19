import { getMonthHours, getMonthProjections } from '../lib/spreadsheet'
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
  } = await getMonthHours(year, month)
  const monthProjections = await getMonthProjections(year, month)

  console.log({ year, month, contractorHours, monthProjections })

  return {
    props: { year, month, contractorHours, monthProjections }
  }
}

export default Leaderboard
