import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getCurrentMonthHours } from '../lib/spreadsheet'
import { createHash } from 'crypto'
import { invertColor } from '../lib/color.js'

type Contractor = {
  name: string,
  hours: number,
  color: string,
  percentage: number,
}

const Home = ({contractors}: {contractors: Contractor[]}) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Common Prefix Leaderboard</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          High Scores - {(new Date()).toLocaleString('default', { month: 'short', year: 'numeric' })}
        </h1>

        {
          contractors.length == 0 ?
          (
            <p>No data yet for this month.</p>
          )
          :
          (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
            {
              contractors.map(
                contractor =>
                <tr className={styles.row} key={contractor.name}>
                  <td>{contractor.name}</td>
                  <td>
                    <div style={{
                      backgroundColor: contractor.color,
                      color: invertColor(contractor.color, true),
                      width:
                      (5 * contractor.percentage + 50) + 'px',
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
                      {Math.round(100 * contractor.hours) / 100}
                    </div>
                  </td>
                </tr>
              )
            }
            </tbody>
          </table>
          )
        }
      </main>
    </div>
  )
}

export async function getServerSideProps() {
  let contractorHours: {
    [index: string]: number
  } = await getCurrentMonthHours()
  let contractors: Contractor[] = []

  const maxHours = Math.max(...Object.values(contractorHours))

  for (const [name, hours] of Object.entries(contractorHours)) {
    contractors.push({
      name, hours,
      color: '#' + createHash('md5').update(name).digest('hex').slice(10, 16),
      percentage: Math.round(100 * hours / maxHours)
    })
  }

  contractors.sort((a, b) => b.hours - a.hours)
  contractors = contractors.filter(contractor => contractor.hours > 0)

  return {
    props: { contractors }
  }
}

export default Home
