import Head from 'next/head'
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Home.module.css'
import mexp from 'math-expression-evaluator'
import Card, { CardType } from '../components/card'
import HistoryInfo, { RoundInfo } from '../components/history'

export function getRandomCards(): CardType[] {
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  let fourCards = [] as CardType[];

  for(var i = 0; i < 4; i++) {
    fourCards.push({
      suit: suits[Math.floor(Math.random() * 4)],
      value: Math.ceil(Math.random() * 13)
    });
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

export default function Home() {
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(0);
  const [cards, setCards] = useState<CardType[]>([]);
  const [rounds, setRounds] = useState<RoundInfo[]>([]);
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
              <div className="basis-8">
                <button type="button"
                        className="float-left text-green-700 border-4 border-green-700 hover:bg-green-700 hover:text-white focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center ">
                  <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                       xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clip-rule="evenodd"></path>
                  </svg>


                  <span className="sr-only">Icon description</span>
                </button>


                <div className="p-4 basis-8 grow-0 shrink-0 text-black text-center text-3xl font-bold">
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
                <input className={styles.input} id="input" autoComplete="off"></input>
                <button className={styles.toggleSubmit} onClick={() => {
                  let input = document.getElementById("input") as HTMLInputElement;
                  let code = verifyOperations(input.value, cards).split('-');
                  let thisRound = {
                    values: cards,
                    color: 0,
                    message: "",
                    setCt: setCount,
                    query: input.value
                  }
                  console.log(thisRound)

                  if(code[0] == "correct") {
                    thisRound.message = "Correct!";
                    setScore(score + 1);
                  }
                  else if(code[0] == "incorrect") {
                    thisRound.message = "Incorrect!";
                    thisRound.color = 1;
                  }
                  else {
                    thisRound.message = "Invalid: " + code[1];
                    thisRound.color = 2;
                  }

                  let newRounds = [...rounds, thisRound as RoundInfo];
                  if(newRounds.length >= 10) {
                    newRounds = newRounds.slice(-10);
                  }
                  setRounds(newRounds);

                  setSetCount(setCount + 1);
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
            <div className="basis-1/4 bg-accent rounded-r-2xl flex flex-col">
              <div className={styles.score}>
                Score: {score} | Set #: {setCount}
              </div>
              <div className="basis-8 grow shrink overflow-auto space-y-2">
                {rounds.slice().reverse().map((round, index) => (
                    <HistoryInfo key={"history-" + index.toString()}
                                 values={round.values}
                                 color={round.color}
                                 message={round.message}
                                 setCt={round.setCt}
                                 query={round.query}/>
                ))}
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
