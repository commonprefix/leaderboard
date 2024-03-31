import styles from '../../styles/Home.module.css'
import Head from 'next/head'
import Image from 'next/image'
import { Tooltip } from 'react-tooltip'
import { getContractorAchievements, getContractorHoursByMonth } from '../../lib/spreadsheet'

function UserProfile(data:
  { error?: string,
    username: string,
    log?: [number, number, number][],
    maxHours?: number,
    achievements: { name: string, description: string, icon: string | null }[],
}) {
  const { username } = data
  let body

  if (data.error) {
    body = data.error
  }
  else {
    let maxHours = data.maxHours!
    body = <>
      <div className={styles.achievements}>
        {
          data.achievements!.map(({ name, description, icon }) => <>
            <div
              className={styles.achievement}
              key={name}
              id={`achievement-${name}`}
              data-tooltip-place="bottom"
              data-tooltip-variant="light"
            >
              <div className={styles.achievementIcon}>
                <Image
                  src={`/assets/icons/${icon ?? name}.svg`}
                  alt={icon ?? name}
                  width={100}
                  height={100}
                />
              </div>
              <div className={styles.achievementName}>{ name }</div>
            </div>
            <Tooltip
              anchorSelect={`#achievement-${name}`}
              content={description}
            />
          </>)
        }
      </div>
      <div className={styles.histogram}>
        {
          data.log!.map(([year, month, hours], index) =>
            <div key={`${year}/${month}`}>
              <div className={styles.histobar} style={{height: Math.round(100 * hours / maxHours) + '%'}}></div>
              <div className={styles.histotext}>{ Math.round(hours) }</div>
            </div>
          )
        }
      </div>
    </>
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
  let achievements

  try {
    log = await getContractorHoursByMonth(username)
    achievements = await getContractorAchievements(username)
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
    props: {
      username,
      log,
      maxHours,
      achievements: achievements.map(
        ({ name, description, icon }) => ({ name, description, icon: icon? icon: null })
      )
    }
  }
}

export default UserProfile
