import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'

interface CardType {
  suit: string;
  value: number;
}

export function getRandomCards(): CardType[] {
  const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
  let fourCards = [] as CardType[];

  for(var i = 0; i < 4; i++) {
    fourCards.push({
      suit: suits[Math.floor(Math.random() * 4)],
      value: Math.ceil(Math.random() * 13)
    });
  }

  return fourCards;
}

export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>(getRandomCards());

  useEffect(() => {
    console.log("generating new cards");
    getRandomCards();
    console.log(cards);
  }, [setCount]);

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
              Score: {score} | Set #: {setCount}
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
