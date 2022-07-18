import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>24 | Multiplayer Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Play 24 <span className={styles.accent}>Together</span></h1>
        <div className={styles.wrapper}>
          <p>Sample text</p>
          { /* Space for players */ }
        </div>
      </main>
    </div>
  )
}
