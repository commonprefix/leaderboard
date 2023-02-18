import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { createHash } from 'crypto'
import { invertColor } from '../lib/color.js'
import Link from 'next/link'

type Contractor = {
  name: string,
  hours: number,
  color: string,
  percentage: number,
}

function prevMonth(year: number, month: number) {
  month -= 1
  if (month == 0) {
    month = 12
    year -= 1
  }
  return `${year}/${('0' + month).slice(-2)}`
}

function nextMonth(year: number, month: number) {
  month += 1
  if (month == 13) {
    month = 1
    year += 1
  }
  return `${year}/${('0' + month).slice(-2)}`
}

export default ({year, month, contractorHours}: {
  year: number,
  month: number,
  contractorHours: {
    [index: string]: number
  }
}) => {
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
  return (
    <div className={styles.container}>
      <Head>
        <title>Common Prefix Leaderboard</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.titleCaption}>High Scores</span>
          <span className={styles.titleArrow}><Link href={`/leaderboard/${prevMonth(year, month)}`}>◀</Link></span>
          <span className={styles.titleDate}>{(new Date(year, month - 1)).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
          <span className={styles.titleArrow}><Link href={`/leaderboard/${nextMonth(year, month)}`}>▶</Link></span>
        </h1>

        {
          contractors.length == 0 ||
          year < 2000 || year > 2100 || month < 1 || month > 12?
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
                      width: (8 + 80 * contractor.percentage / 100) + '%',
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