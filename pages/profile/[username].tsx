import styles from '../../styles/Home.module.css'
import Head from 'next/head'

function UserProfile({ username }: { username: string }) {
  console.log({ username })

  return <div className={styles.container}>
    <Head>
      <title>Common Prefix Leaderboard</title>
    </Head>

    <main className={styles.main}>
      <h1 className={styles.title}>
        <span className={styles.titleCaption}>{ username }</span>
      </h1>
    </main>
  </div>
}

export async function getServerSideProps(context: any) {
  const username = context.params.username

  return {
    props: { username }
  }
}

export default UserProfile
