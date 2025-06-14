import { getMonthHoursByContractor, getMonthProjections, LoggedHours } from '../../lib/spreadsheet'
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

  const contractorHours: {
    [index: string]: LoggedHours
  } = await getMonthHoursByContractor(year, month)

  const monthProjections:{
    [index: string]: number
  } = await getMonthProjections(year, month)

  return {
    props: { year, month, contractorHours, monthProjections }
  }
}

export default Leaderboard
