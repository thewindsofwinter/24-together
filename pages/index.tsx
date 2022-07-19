import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'

export default function Home() {
  const [score, setScore] = useState<number>(0);

  return (
    <div className={styles.container}>
      <Head>
        <title>24 | Multiplayer Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}><span className={styles.accent}>Play 24</span> Together</h1>
        <div className={styles.wrapper}>
          <div className={styles.play}></div>
          <div className={styles.actions}>
            <p className={styles.score}>
              Your Score: {score}
            </p>
            <button className={styles.nextSet} onClick={() => { setScore(score + 4); }}>
              Next Set
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
