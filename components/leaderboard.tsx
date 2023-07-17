import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { createHash } from 'crypto'
import { invertColor } from '../lib/color.js'
import Link from 'next/link'

type Contractor = {
  name: string,
  hours: number,
  hoursProjection?: number,
  color: string,
  percentage: number,
  percentageProjection?: number
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

export default ({year, month, contractorHours, monthProjections}: {
  year: number,
  month: number,
  contractorHours: {
    [index: string]: number
  },
  monthProjections: {
    [index: string]: number
  }
}) => {
  let contractors: Contractor[] = []

  const maxHours = Math.max(
    ...[...Object.values(contractorHours), ...Object.values(monthProjections)]
  )

  for (const [name, hours] of Object.entries(contractorHours)) {
    const contractor: Contractor = {
      name, hours,
      color: '#' + createHash('md5').update(name).digest('hex').slice(10, 16),
      percentage: Math.round(100 * hours / maxHours)
    }

    if (monthProjections[name]) {
      contractor.hoursProjection = monthProjections[name]
      contractor.percentageProjection = Math.round(100 * monthProjections[name] / maxHours)
    }

    contractors.push(contractor)
  }

  contractors.sort((a, b) => b.hours - a.hours)
  contractors = contractors.filter(contractor => contractor.hours > 0)

  const prevLink = prevMonth(year, month)
  const nextLink = nextMonth(year, month)

  const html = (
    <div className={styles.container}>
      <Head>
        <title>Common Prefix Leaderboard</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.titleCaption}>High Scores</span>
          <span className={styles.titleArrow} title={prevLink}>
            <Link href={`/leaderboard/${prevLink}`}>◀</Link>
          </span>
          <span className={`${styles.titleDate} ${styles.titleDateLong}`}>{(new Date(year, month - 1)).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
          <span className={`${styles.titleDate} ${styles.titleDateShort}`}>{(new Date(year, month - 1)).toLocaleString('default', { month: 'short', year: '2-digit' })}</span>
          <span className={styles.titleArrow} title={nextLink}>
          {
            year == new Date().getFullYear() && month == new Date().getMonth() + 1?
            <></>: <Link href={`/leaderboard/${nextLink}`}>▶</Link>
          }
          </span>
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
                <th className={styles.emoji}></th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
            {
              contractors.map(
                (contractor, i) => {
                  const emoji =
                    i == 0? '🥇':
                    i == 1? '🥈':
                    i == 2? '🥉': ''

                  return <tr className={styles.row} key={contractor.name}>
                    <td className={
                      (emoji == ''? styles.empty: '') +
                      ' ' +
                      styles.emoji}>{emoji}</td>
                    <td className={styles.contractor}>{contractor.name}</td>
                    <td className={styles.progressBarContainer}>
                      <div></div>
                      <div>
                      <canvas id={`lala${contractor.name}`} width="150" height="15"></canvas>
                      </div>
                      {
                        contractor.hoursProjection && contractor.percentageProjection?
                        <div style={{
                          width: (contractor.percentageProjection) + '%',
                          borderRight:
                            contractor.hoursProjection < contractor.hours?
                            '3px dashed ' + invertColor(contractor.color, true):
                            '3px dashed rgba(255, 255, 255, 0.3)'
                          }}
                          className={`${styles.progressBar} ${styles.projectionBar}`}
                          title={`${Math.round(100 * contractor.hours) / 100} hours worked of ${contractor.hoursProjection} projected`}
                          ></div>: <></>
                      }
                    </td>
                    </tr>
                }
              )
            }
            </tbody>
          </table>
          )
        }
      </main>
    </div>
  )
  console.log("adsf")
  const canvas = document.getElementById("lalaOrfeas")
  //console.log("lkjh")
  //const ctx = canvas.getContext("2d")
  //ctx.fillText("a", 10, 10)

  return html
}
