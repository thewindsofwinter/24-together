import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'

export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);

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
            <div className={styles.score}>
              <p className={styles.counter}>Score: {score}</p>
              <p className={styles.counter}>Set #: {setCount}</p>
            </div>
            <div className={styles.controls}>
              <div className={styles.newGame} onClick={() => { setScore(0); setSetCount(0); }}>
                New Game
              </div>
              <div className={styles.nextSet} onClick={() => { setSetCount(score + 1); }}>
                Next Set
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
