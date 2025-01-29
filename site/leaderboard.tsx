import styles from '../styles/Home.module.css'
import { createHash } from 'crypto'
import { invertColor } from '../lib/color.js'

export default ({year, month, contractorHours, monthProjections}) => {
  let contractors = []

  const maxHours = Math.max(
    ...[...Object.values(contractorHours), ...Object.values(monthProjections)]
  )

  for (const [name, hours] of Object.entries(contractorHours)) {
    const contractor = {
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

  return (
    <div className="container">
      <Head>
        <title>Common Prefix Leaderboard</title>
      </Head>

      <main className="main">
        <h1 className="title">
          <span className="titleCaption">High Scores</span>
        </h1>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="row" key="name">
              <td className="contractor">contractor.name</td>
              <td className="progressBarContainer">
                <div></div>
                <div style="background-color:#84d7e0;color:#000000;width:30.4%" class="progressBar">
                  33.9
                </div>
                  <div style="width:34.4%';border-right:3px dashed rgba(255, 255, 255, 0.3)" class="progressBar projectionBar" title="33.9 hours worked of 40 projected"></div>
              </td>
              </tr>
          </tbody>
        </table>
      </main>
    </div>
  )
}
