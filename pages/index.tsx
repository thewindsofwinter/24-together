import Head from 'next/head'
import Pusher from 'pusher-js'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from '../styles/Home.module.css'
import mexp from 'math-expression-evaluator'
import Timer from '../components/timer'
import Card, { CardType } from '../components/card'
import HistoryInfo, { RoundInfo } from '../components/history'
import Controls, { updateCardDB } from '../components/controls'
import { child, get, getDatabase, onChildChanged, onValue, ref, set } from "firebase/database";
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

export function resize(hide: HTMLElement, txt: HTMLInputElement) {
  hide.textContent = txt.value;
  txt.style.width = (hide.offsetWidth + 1) + "px";
}

export default function Home() {
  const [username, setUsername] = useState<string>("birb");
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(1);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [cards, setCards] = useState<CardType[]>([]);
  const rounds = useRef<RoundInfo[]>([]);
  // Might make this a toggle button
  const [submitText, setSubmitText] = useState<string>("I found 24!");
  const [submitToggle, setSubmitToggle] = useState<boolean>(false);
  const [time, setTime] = useState(0);
  const [reset, setReset] = useState(false);

  useEffect(() => {
    let interval = null;
    if (!reset) {
      interval = setInterval(() => {
        setTime((time) => time + 10);
      }, 10);
    } else {
      clearInterval(interval);
      setTime(0);
      setReset(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [reset]);


  // head off hydration problem
  useEffect(() => {
    // Get the input field
    var input = document.getElementById("input");

    // Execute a function when the user presses a key on the keyboard
    input.addEventListener("keypress", function(event) {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        setSubmitToggle(true);
        document.getElementById("submit").click();
        setTimeout(function() { setSubmitToggle(false); }, 200);
      }
    });

    let suffix = String(new Date().getTime()).substr(-3)
    // 0.7% chance
    if(parseInt(suffix) > 992) {
      suffix = "ket"
    }
    setUsername("birb-" + suffix)

    const hide = document.getElementById('hide') as HTMLElement;
    const txt = document.getElementById('txt') as HTMLInputElement;
    txt.value = "birb-" + suffix;

    resize(hide, txt);
    txt.addEventListener("input", function() {
      resize(hide, txt);
    });

    txt.addEventListener("blur", function() {
      setUsername(txt.value);
      // send message that username has changed
    })

    rounds.current = [{
      values: [],
      color: 2,
      message: "[INFO] Welcome, birb-" + suffix + "!",
      query: "",
      label: "System Message"
    } as RoundInfo];

    // Only need to do this at the start
    console.log("getting round data from firebase")
    get(child(ref(database), `set`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        setSetCount(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

    get(child(ref(database), `attempt`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
        setAttemptCount(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });

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

      // TODO: MAKE THIS LESS SHAKY, AS WE MIGHT SEND OTHER SYSTEM MESSAGES BESIDES SET
      if(value.message === "Correct!" || value.label === "System Message") {
        setSetCount((setCount) => {
          set(ref(database, 'set/'), setCount + 1);
          return setCount + 1;
        })

        setReset(true);

        setAttemptCount((attemptCount) => {
          set(ref(database, 'attempt/'), 1);
          return 1;
        })
      }
      else {
        setAttemptCount((attemptCount) => {
          set(ref(database, 'attempt/'), setCount + 1);
          return attemptCount + 1;
        })
      }
    });

    channel.bind('restart-game', function(data) {
      let value = data.notif as RoundInfo;

      rounds.current = [...rounds.current, value];
      setScore(0);
      setReset(true);
      set(ref(database, 'set/'), 1);
      setSetCount(1);
      set(ref(database, 'attempt/'), 1);
      setAttemptCount(1);
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
          <div className="basis-1/5 bg-accent rounded-l-2xl flex flex-col bg-gray-50">
            <div className="basis-8 grow-0 shrink-0 text-center font-black text-teal-900 bg-gray-300 text-2xl py-6 p-4 rounded-tl-xl">
              Player List
            </div>
            <div className="basis-8 grow shrink overflow-auto space-y-8">


            </div>
            <div className="flex flex-row border-2 rounded-bl-xl border-gray-300 bg-gray-300">
            <div className="min-w-fit bg-none pl-2 pr-2 text-base flex items-center">
              <span className="font-bold">
                <span id="hide"></span>
                <input id="txt" className={styles.usernameInput}></input>:
              </span>
            </div>
            <input className="flex-grow border-0 h-12 align-top outline-none p-1 pl-2 text-base w-0	min-w-0" id="chat"></input>
            <button className="outline-none bg-white min-w-fit">
              <img src="/right-arrow.svg" className="w-4 h-4 mr-2"/>
            </button>

            </div>
          </div>


          <div className="basis-3/5 p-4 flex flex-col">
            <div className="basis-8">
              <button type="button"
                      className="float-left text-green-700 border-4 border-green-700 hover:bg-green-700 hover:text-white focus:outline-none font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center ">
                 <img className="w-5 h-5" src="/arrow-icon.svg" />
                <span className="sr-only">Information Button</span>
              </button>


              <div className="p-4 pt-0 basis-8 grow-0 shrink-0 text-black text-center text-4xl font-bold">
                Set {setCount}, Attempt {attemptCount}
              </div>
            </div>
            <div className="basis-4/5 grow">
              <div className="flex flex-wrap -mb-4 -mx-2 w-full">
                {cards.map((card, index) => (
                    <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={false}></Card>
                ))}
              </div>
            </div>

            <div className="p-4 basis-8 grow-0 shrink-0 text-black text-center text-2xl font-bold">
              {score} {score === 1 ? "point" : "points"}
            </div>

            <div className={styles.inputBar}>
              <input className={styles.input} id="input"></input>
              <button className={submitToggle ? styles.hovered + ' ' + styles.toggleSubmit
                : styles.toggleSubmit} id="submit" onClick={() => {
                let input = document.getElementById("input") as HTMLInputElement;

                let code = verifyOperations(input.value, cards).split('-');
                let thisRound = {
                  values: cards,
                  color: 0,
                  message: "",
                  query: "Query: \"" + input.value + "\" by " + username
                  + " after " + (time - time%10)/1000 + " seconds",
                  label: "Set #" + setCount + ", Attempt " + attemptCount
                }
                console.log(thisRound)

                if(code[0] == "correct") {
                  thisRound.message = "Correct!";
                  setScore(score + 1);
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

            <div className="text-xs basis-8 mx-auto mt-2" id="instructions">
              <strong>Instructions:</strong> For each round, enter the point values of all four cards
              with a valid mathematical combination of basic operators <code>[+, -, *, /]</code> and
              parentheses <code>[(, )]</code> which evaluates to 24. All rounds are guaranteed to be
              solvable. Submit your answer before all your opponents to win the round!&nbsp;
              <a className={styles.hideButton} onClick={() =>
                { document.getElementById("instructions").style.display = "none"; }
              }>[hide]</a>
            </div>
          </div>
          {/*timer/history*/}
          <div className="basis-1/5 bg-accent rounded-r-2xl flex flex-col bg-green-50">
            <div className="basis-8 grow-0 shrink-0 text-center text-white bg-teal-900 text-2xl py-6 p-4 rounded-tr-2xl">
              <Timer time={time} />
            </div>
            <div className="basis-8 grow shrink overflow-y-scroll space-y-8 pt-2 pl-1 pr-1">
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

            <Controls username={username} />
          </div>
          </div>
        </main>
    </div>
  )
}
