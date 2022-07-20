import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'
import mexp from 'math-expression-evaluator'

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

export function verifyOperations(input: string, cards: CardType[]): bool {
  for (var i = 0; i < input.length; i++) {
    let char = input.charAt(i);
    if(char != '+' && char != '-' && char != '*' && char != '/' && char != '('
        && char != ')' && !(c >= '0' && c <= '9')) {
          return false;
    }
  }


  try {

    val = mexp.eval(input);
  }
  catch(e){
    return false;
  }
}

export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>([]);
  // Might make this a toggle button
  const [submitText, setSubmitText] = useState<string>("I found 24!");

  // head off hydration problem
  useEffect(() => setCards(getRandomCards()), [])
  useEffect(() => {
    console.log("generating new cards");
    setCards(getRandomCards());
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
          <div className={styles.play}>
            <div className={styles.displayCards}>
              {cards.map((card) => (
                <p>{card.value}</p>
              ))}
            </div>
            <div className={styles.inputBar}>
              <input className={styles.input}></input>
              <button className={styles.toggleSubmit}>{submitText}</button>
            </div>

            <div className={styles.instructions} id="instructions">
              <strong>Instructions:</strong> For each round, enter the point values of all four cards
              with a valid mathematical combination of basic operators <code>[+, -, *, /]</code> and
              parentheses <code>[(, )]</code> which evaluates to 24. Submit your answer before all your
              opponents to win the round!&nbsp;
              <a className={styles.hideButton} onClick={() =>
                { document.getElementById("instructions").style.display = "none"; }
              }>[hide]</a>
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.score}>
              Score: {score} | Set #: {setCount}
            </div>
            <div className={styles.controls}>
              <div className={styles.newGame} onClick={() => { setScore(0); setSetCount(0); setCards(getRandomCards()); }}>
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
