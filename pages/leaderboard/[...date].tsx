import { getMonthHours } from '../../lib/spreadsheet'
import Leaderboard from '../../components/leaderboard'

function getCurrentDate() {
  const nowDate = new Date()

  return {
    year: nowDate.getFullYear(),
    month: nowDate.getMonth() + 1
  }
}

export async function getServerSideProps(context: any) {
  let [year, month] = context.params.date
  year = parseInt(year)
  month = parseInt(month)

  let contractorHours: {
    [index: string]: number
  } = await getMonthHours(year, month)

  return {
    props: { year, month, contractorHours }
  }
}

export default Leaderboard
