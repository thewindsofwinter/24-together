import Head from 'next/head'
import Pusher from 'pusher-js'
import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles/Home.module.css'
import DesktopApp from '../components/desktop'
import MobileApp from '../components/mobile'
import { updateCardDB } from '../components/controls'
import { sendUsernameChange } from '../lib/pusher-funcs.ts'
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

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== 'undefined') {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}


export function resize(hide: HTMLElement, txt: HTMLInputElement) {
  hide.textContent = txt.value;
  txt.style.width = (hide.offsetWidth + 1) + "px";
}

const chatColor = ['text-red-600', 'text-green-600', 'text-blue-600', 'text-pink-400', 'text-purple-700'][Math.floor(Math.random() * 5)];
export default function Home() {
  const [username, setUsername] = useState<string>("birb");
  const [score, setScore] = useState<number>(0);
  const [setCount, setSetCount] = useState<number>(1);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [cards, setCards] = useState<CardType[]>([]);
  const rounds = useRef<RoundInfo[]>([]);
  const [chatMsgs, setChatMsgs] = useState<MessageInfo[]>([]);
  // Might make this a toggle button
  const [submitText, setSubmitText] = useState<string>("I found 24!");
  const [submitToggle, setSubmitToggle] = useState<boolean>(false);
  const [time, setTime] = useState(0);
  const [reset, setReset] = useState(false);
  const size = useWindowSize();

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
    var chat = document.getElementById("chat");
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
    chat.addEventListener("keypress", function(event) {
      // If the user presses the "Enter" key on the keyboard
      if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        document.getElementById("send").click();
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
      setUsername((username) => {
        sendUsernameChange(username, chatColor, txt.value);
        return txt.value;
      });
      // send message that username has changed
    })

    rounds.current = [];
    setChatMsgs([{
        tag: "[INFO]",
        color: "text-black",
        message: "Welcome, birb-" + suffix + "!",
      } as MessageInfo]);

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

    const hist_channel = pusher.subscribe('history');

    hist_channel.bind('send-history', function(data) {
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

        setScore((score) => { return score + 1; });
        updateCardDB();
      }
      else {
        setAttemptCount((attemptCount) => {
          set(ref(database, 'attempt/'), setCount + 1);
          return attemptCount + 1;
        })
      }
    });

    hist_channel.bind('send-chat', function(data) {
      let messageData = data as MessageInfo;
      console.log(messageData);


      setChatMsgs((chatMsgs) => {

        return [...chatMsgs, messageData]; });

    });

    hist_channel.bind('restart-game', function(data) {
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

      {
        size.width > 768 ? <DesktopApp username={username} score={score} setCount={setCount}
        attemptCount={attemptCount} cards={cards} rounds={rounds} time={time}
        chatMsgs={chatMsgs} submitToggle={submitToggle} chatColor={chatColor} />
        : <MobileApp username={username} score={score} setCount={setCount}
        attemptCount={attemptCount} cards={cards} rounds={rounds} time={time}
        chatMsgs={chatMsgs} submitToggle={submitToggle} chatColor={chatColor} />
      }

    </div>
  )
}
