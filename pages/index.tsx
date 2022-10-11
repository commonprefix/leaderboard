import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getCurrentMonthHours } from '../lib/spreadsheet.js'
import { createHash } from 'crypto'
import { invertColor } from '../lib/color.js'

type Contractor = {
  name: string,
  hours: number,
  color?: string,
  percentage?: number,
}

const Home: NextPage = ({contractors}: {contractors: Contractor[]}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Common Prefix Leaderboard</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          High Scores - {(new Date()).toLocaleString('default', { month: 'short', year: 'numeric' })}
        </h1>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
          {
            contractors.length == 0 ? (
              <p>No data yet for this month.</p>
            ) :
            contractors.map(
              contractor =>
              <tr className={styles.row}>
                <td>{contractor.name}</td>
                <td>
                  <div style={{
                    backgroundColor: contractor.color,
                    color: invertColor(contractor.color, true),
                    width: (5 * contractor.percentage + 50) + 'px',
                    height: '30px',
                    marginLeft: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '5px',
                    borderColor: '#eee',
                    borderWidth: '5px',
                    borderRightStyle: 'solid'
                  }}>
                    {contractor.hours}
                  </div>
                </td>
              </tr>
            )
          }
          </tbody>
        </table>
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  let contractors: Contractor[] = await getCurrentMonthHours()

  if (contractors.length == 0) {
    return contractors
  }

  contractors.sort((a, b) => b.hours - a.hours)
  contractors = contractors.filter(contractor => contractor.hours > 0)

  const maxHours = contractors[0].hours

  for (const contractor of contractors) {
    contractor.color = '#' + createHash('md5').update(contractor.name).digest('hex').slice(10, 16)
    contractor.percentage = Math.round(contractor.hours / maxHours * 100)
  }

  return {
    props: { contractors }
  }
}

export default Home
