import Head from 'next/head'
import Pusher from 'pusher-js'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from '../styles/Home.module.css'
import mexp from 'math-expression-evaluator'
import Card, { CardType } from '../components/card'
import HistoryInfo, { RoundInfo } from '../components/history'
import { get, getDatabase, onChildChanged, onValue, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://together-24game-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export async function getRandomCards(): CardType[] {
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  let ok = false;
  let fourCards = [] as CardType[];

  while(!ok) {
    fourCards = []
    for(var i = 0; i < 4; i++) {
      fourCards.push({
        suit: suits[Math.floor(Math.random() * 4)],
        value: Math.ceil(Math.random() * 13)
      });
    }

    ok = await !isUnsolvable(getCardsSorted(fourCards));
  }

  return fourCards;
}

export function verifyOperations(input: string, cards: CardType[]): string {
  console.log("received " + input)
  for(var i = 0; i < input.length; i++) {
    let char = input.charAt(i);
    if(char !== '+' && char !== '-' && char !== '*' && char !== '/' && char !== '('
        && char !== ')' && char !== ' ' && !(char >= '0' && char <= '9')) {
      return "invalid-Bad Character";
    }
  }

  // Check if the string can be split for cards
  let found = [false, false, false, false]
  let tokens = input.split(/\D/)
  for(var i = 0; i < tokens.length; i++) {
    if(tokens[i] !== "") {
      let val = parseInt(tokens[i]);
      let ok = false;
      for(var j = 0; j < 4; j++) {
        if(!found[j] && cards[j].value === val) {
          found[j] = true;
          ok = true;
          break;
        }
      }

      if(!ok) {
        return "invalid-Extra Number";
      }
    }
  }

  for(var i = 0; i < 4; i++) {
    if(!found[i]) {
      return "invalid-Missing Number";
    }
  }

  try {
    let val = mexp.eval(input);
    console.log("valid and evaluated: " + val);
    if(val === 24) {
      return "correct"
    }
    else {
      return "incorrect"
    }
  }
  catch(e){
    return "invalid-Bad Expression";
  }
}

export function getCardsSorted(cards: CardType[]): number[] {
  let numbers = [];
  for (let index = 0; index < cards.length; index++) {
    numbers.push(cards[index].value as number);
  }
  numbers.sort((a, b) => a - b);

  console.log(numbers);

  return numbers;
}

export async function isUnsolvable(sortedCards: number[]): boolean {
  let val = await fetch('unsolvable.txt')
  .then(response => response.text())
  .then(text => {
    let str = text.split(/\r?\n/);
    console.log(str[0].split(" "));
    str.forEach(element => {
      let tokens = str[0].split(" ");
      // console.log(tokens.length + " " + sortedCards.length)
      let ok = true;
      if(sortedCards.length != tokens.length) {
        ok = false;
      } else {
        for(var i = 0; i < tokens.length; i++) {
          // console.log("hi " + sortedCards[i] + " " + tokens[i])
          if(sortedCards[i] != parseInt(tokens[i])) {
            // console.log(i + " " + sortedCards[i] + " " + parseInt(tokens[i]))
            ok = false;
          }
        }
      }
      console.log(ok)

      if(ok) {
        console.log(ok)
        return true;
      }
    });

    return false;
  })

  return val;
}

export async function updateCardDB() {
  let newCards = await getRandomCards();

  let wrappedCards = {
    first: newCards[0],
    second: newCards[1],
    third: newCards[2],
    fourth: newCards[3]
  };

  console.log(wrappedCards);
  set(ref(database, 'cards/'), wrappedCards);
}

export function newGame(username: string) {
  updateCardDB();

  let thisRound = {
    values: [],
    color: 2,
    message: "[INFO] " + username + " reset game",
    query: "",
    label: "System Message"
  }

  fetch("/api/pusher-newround", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(thisRound),
  });
}

export function nextRound(username: string) {
  updateCardDB();

  let thisRound = {
    values: [],
    color: 2,
    message: "[INFO] " + username + " skipped the last round",
    query: "",
    label: "System Message"
  }

  fetch("/api/pusher", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(thisRound),
  });
}



export default function Home() {
  const [username, setUsername] = useState<string>("birb-" + String(new Date().getTime()).substr(-3));
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const rounds = useRef<RoundInfo[]>([]);
  // Might make this a toggle button
  const [submitText, setSubmitText] = useState<string>("I found 24!");

  // head off hydration problem
  useEffect(() => {
    rounds.current = [{
      values: [],
      color: 2,
      message: "[INFO] Welcome, " + username + "!",
      query: "",
      label: "System Message"
    } as RoundInfo];

    console.log("getting cards from firebase");

    onValue(ref(database), (snapshot) => {
      // console.log(snapshot.val());
      let cardVals = snapshot.val().cards;
      console.log(cardVals);
      setCards([cardVals.first, cardVals.second, cardVals.third, cardVals.fourth] as CardType[]);
    });

    // setCards(getRandomCards());

    const pusher = new Pusher(process.env.NEXT_PUBLIC_API_KEY, {
      cluster: process.env.NEXT_PUBLIC_CLUSTER,
    });

    const channel = pusher.subscribe('history');

    channel.bind('send-history', function(data) {
      let value = data.history as RoundInfo;

      rounds.current = [...rounds.current, value];
      setSetCount((setCount) => { return setCount + 1; })
    });

    channel.bind('restart-game', function(data) {
      let value = data.notif as RoundInfo;

      rounds.current = [...rounds.current, value];
      setScore(0);
      setSetCount(0);
    });
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>24 | Multiplayer Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}><span className={styles.accent}>Play 24</span> Together</h1>
        <div className={styles.wrapper}>

          {/*player/chat*/}
          <div className="basis-1/4 bg-accent rounded-l-2xl flex flex-col bg-green-50">
            <div className="basis-8 grow-0 shrink-0 text-center font-black text-black text-2xl my-4 p-4">
              Player List
            </div>
            <div className="basis-8 grow shrink overflow-auto space-y-8">

            </div>
            <div className={styles.controls}>
              <div className={styles.newGame} onClick={() => { newGame(username); }}>
                New Game
              </div>
              <div className={styles.nextSet} onClick={() => { nextRound(username); }}>
                Next Set
              </div>
            </div>
          </div>


          <div className={styles.play}>

            <div className="basis-8">
              <button type="button"
                      className="float-left text-green-700 border-4 border-green-700 hover:bg-green-700 hover:text-white focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center ">
                 <img className="w-5 h-5" src="/arrow-icon.svg" />
                <span className="sr-only">Icon description</span>
              </button>


              <div className="p-4 basis-8 grow-0 shrink-0 text-black text-center text-4xl font-bold">
                Set {setCount}
              </div>
            </div>
            <div className="basis-4/5 grow ">
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

                let code = verifyOperations(input.value, cards).split('-');
                let thisRound = {
                  values: cards,
                  color: 0,
                  message: "",
                  query: "Query: \"" + input.value + "\" by " + username,
                  label: "Set #" + setCount
                }
                console.log(thisRound)

                if(code[0] == "correct") {
                  thisRound.message = "Correct!";
                  updateCardDB();
                }
                else if(code[0] == "incorrect") {
                  thisRound.message = "Incorrect!";
                  thisRound.color = 1;
                }
                else {
                  thisRound.message = "Invalid: " + code[1];
                  thisRound.color = 2;
                }

                console.log(JSON.stringify(thisRound))
                // send info, answer not important
                fetch("/api/pusher", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(thisRound),
                });

                input.value = "";
              }}>{submitText}</button>
            </div>

            <div className="text-xs w-[9/10] mx-auto" id="instructions">
              <strong>Instructions:</strong> For each round, enter the point values of all four cards
              with a valid mathematical combination of basic operators <code>[+, -, *, /]</code> and
              parentheses <code>[(, )]</code> which evaluates to 24. Submit your answer before all your
              opponents to win the round!&nbsp;
              <a className={styles.hideButton} onClick={() =>
                { document.getElementById("instructions").style.display = "none"; }
              }>[hide]</a>
            </div>
          </div>
          {/*timer/history*/}
          <div className="basis-1/4 bg-accent rounded-r-2xl flex flex-col bg-green-50">
            <div className="basis-8 grow-0 shrink-0 text-center text-black text-3xl my-3 p-4">
              <img className="w-8 h-8 inline-block mx-0.5 pb-0.5"  src="/timer-icon.svg" />
              1:05
            </div>
            <div className="basis-8 grow shrink overflow-y-scroll space-y-8">
              {rounds.current.slice().reverse().map((round, index) => (
                  <HistoryInfo key={"history-" + index.toString()}
                               values={round.values}
                               color={round.color}
                               message={round.message}
                               label={round.label}
                               query={round.query}/>
              ))}
              <div className="mb-3"/>
            </div>
            <div className="flex flex-row border-2 rounded-br-xl">
            <input className="flex-grow border-0 h-12 align-top outline-none p-1" id="input"></input>
            <button className="outline-none bg-white rounded-br-xl">
              <img src="/right-arrow.svg" className="w-4 h-4 mr-1"/>
            </button>

            </div>
          </div>
          </div>
        </main>
    </div>
  )
}
