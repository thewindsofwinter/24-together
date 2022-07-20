import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'
import Card from '../components/card'


interface CardType {
  suit: string;
  value: number;
}

export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>([]);

  return (
    <div className={styles.container}>
      <Head>
        <title>24 | Multiplayer Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}><span className={styles.accent}>Play 24</span> Together</h1>
        <div className={styles.wrapper}>
          <div className={styles.play}>
              <div className="flex flex-wrap -mb-4 -mx-2 w-full">

                  <Card suit="diamonds" val={5}></Card>
                  <Card suit="spades" val={5}></Card>
                  <Card suit="clubs" val={5}></Card>
                  <Card suit="hearts" val={5}></Card>

              </div>

          </div>
          <div className={styles.actions}>
            <div className={styles.score}>
              <div className={styles.counter}>Score: {score}</div>
              <div className={styles.counter}>Set #: {setCount}</div>
            </div>
            <div className={styles.controls}>
              <div className={styles.newGame} onClick={() => { setScore(0); setSetCount(0); }}>
                New Game
              </div>
              <div className={styles.nextSet} onClick={() => { setSetCount(setCount + 1); }}>
                Next Set
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
