import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'
import Card, { CardType } from '../components/card'
import HistoryInfo, { RoundInfo } from '../components/history'
import io from "socket.io-client";

// socket.io
let socket;

export default function Home() {
  const [username, setUsername] = useState<string>("orzosity");
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const [rounds, setRounds] = useState<RoundInfo[]>([]);

  // Might make this a toggle button
  // const [submitText, setSubmitText] = useState<string>("I found 24!");

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket = io();

    socket.on("guessEvaluation", (msg) => {
      let thisRound = {
        values: cards,
        color: 0,
        message: msg.evaluation,
        query: msg.guess + " by " + msg.sender
      }
      console.log(thisRound)

      if(msg.evaluation === "Correct!") {
        if(msg.sender === username) {
          setScore(score + 1);
        }

        setSetCount(setCount + 1);
        setCards(msg.cards);
      }
      else if(msg.evaluation === "Incorrect!") {
        thisRound.color = 1;
      }
      else {
        thisRound.color = 2;
      }

      let newRounds = [...rounds, thisRound as RoundInfo];
      setRounds(newRounds);
    })

    socket.on("currentCards", (msg) => {
      setCards((currentMsg) => msg.cards);
      console.log(cards);
    });

    // Get cards
    socket.emit("getCards", {})
  };

  const sendMessage = async (input) => {
    socket.emit("sendGuess", { author: username, input: input });
  };

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
              <div className="flex flex-wrap -mb-4 -mx-2 w-full">
              {cards.map((card, index) => (
                <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={false}></Card>
              ))}
              </div>
            </div>
            <div className={styles.inputBar}>
              <input className={styles.input} id="input"></input>
              <button className={styles.toggleSubmit} onClick={() => {
                let input = document.getElementById("input") as HTMLInputElement;
                sendMessage(input.value);
                input.value = "";
              }}>I found 24!</button>
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
            <div className={styles.history}>
            {rounds.map((round, index) => (
              <HistoryInfo key={"history-" + index.toString()}
                values={round.values}
                color={round.color}
                message={round.message}
                query={round.query}/>
            ))}
            </div>
            // TODO: MAKE CONTROLS WORK
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
