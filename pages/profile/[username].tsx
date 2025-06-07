import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import { getContractorHoursByMonth } from '../../lib/spreadsheet'

function UserProfile(data:
  { error?: string,
    username: string,
    log?: [number, number, number][],
    maxHours?: number }) {
  const { username } = data
  let body

  if (data.error) {
    body = data.error
  }
  else {
    let maxHours = data.maxHours!
    body = <div className={styles.histogram}>
      {
        data.log!.map(([year, month, hours], index) =>
          <div key={index}>
            <div className={styles.histobar} style={{height: Math.round(100 * hours / maxHours) + '%'}}></div>
            <div className={styles.histotext}>{ Math.round(hours) }</div>
          </div>
        )
      }
    </div>
  }

  return <div className={styles.container}>
    <Head>
      <title>{ `${username} - Common Prefix Leaderboard` }</title>
    </Head>

    <main className={styles.main}>
      <h1 className={styles.title}>
        <span className={styles.titleCaption}>{ username }</span>
      </h1>

      { body }
    </main>
  </div>
}

export async function getServerSideProps(context: any) {
  const username = context.params.username
  let log

  return {
    props: {
      username: 'dionyziz',
      maxHours: 70,
      log: [
        [2023, 1, 30],
        [2023, 2, 70],
        [2023, 3, 17.5]
      ]
    }
  }

  try {
    log = await getContractorHoursByMonth(username)
  }
  catch {
    return {
      props: {
        username,
        error: 'Failed to fetch data'
      }
    }
  }
  log = log.slice(-20)

  let maxHours = 1

  for (const [year, month, hours] of log) {
    maxHours = Math.max(hours, maxHours)
  }

  return {
    props: { username, log, maxHours }
  }
}

export default UserProfile
