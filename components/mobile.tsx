import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css'
import Timer from '../components/timer'
import Card, { CardType } from '../components/card'
import HistoryInfo, { RoundInfo } from '../components/history'
import Controls, { updateCardDB } from '../components/controls'
import ChatMessage, { MessageInfo } from '../components/chat'
import { sendChat } from '../lib/pusher-funcs'
import { verifyOperations } from '../lib/math-funcs'

type Props = {
    username: string,
    score: number,
    setCount: number,
    attemptCount: number,
    cards: CardType[],
    rounds: RoundInfo[],
    chatMsgs: MessageInfo[],
    submitToggle: boolean,
    time: number,
    chatColor: string,
    buttonAnimate: () => void,
    updateChatLabel: (txt: HTMLInputElement) => void
}

export function resize(hide: HTMLElement, txt: HTMLInputElement) {
  hide.textContent = txt.value;
  txt.style.width = (hide.offsetWidth + 1) + "px";
}

export default function DesktopApp(props: Props) {
  let username = props.username;
  let score = props.score;
  let setCount = props.setCount;
  let attemptCount = props.attemptCount;
  let cards = props.cards;
  let rounds = props.rounds;
  let chatMsgs = props.chatMsgs;
  let submitToggle = props.submitToggle;
  let time = props.time;
  let chatColor = props.chatColor;
  let buttonAnimate = props.buttonAnimate;
  let updateChatLabel = props.updateChatLabel;
  let [fade, setFade] = useState<boolean>(false);

  const scrollBottomRef = useRef(null);
  const scrollToBottom = () => {
    if(scrollBottomRef != null) {
      scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(scrollToBottom, [chatMsgs]);

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
        document.getElementById("submit").click();
        buttonAnimate();
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

    const hide = document.getElementById('hide') as HTMLElement;
    const txt = document.getElementById('txt') as HTMLInputElement;

    txt.addEventListener("input", function() {
      resize(hide, txt);
    });

    txt.addEventListener("blur", function() {
      updateChatLabel(txt);
    })
  }, []);

  useEffect(() => {
    setFade(true);
    setTimeout(() => {
      setFade(false);
    }, 2000);
  }, [attemptCount]);

  useEffect(() => {
    const hide = document.getElementById('hide') as HTMLElement;
    const txt = document.getElementById('txt') as HTMLInputElement;
    txt.value = username;

    resize(hide, txt);
  }, [username]);

  return (
    <main className={styles.main}>
      <div className={styles.wrapper}>
        <div className="flex flex-col w-full">
        <div className="text-center text-white bg-teal-900 text-2xl rounded-t-2xl py-6 p-4">
          <Timer time={time} />
        </div>
        <div className="basis-8 grow shrink overflow-auto space-y-1 pl-2 pb-1 pt-2 min-h-[4rem]">
          {chatMsgs.map((chat, index) => (
              <ChatMessage key={"message-" + index.toString()}
                           {...chat}/>
          ))}
          <div id="scroll-to-bottom" className="float-left clear-both" ref={scrollBottomRef}/>
        </div>
        <div className="flex flex-row border-2 border-gray-300 bg-gray-300">
        <div className="min-w-fit bg-none pl-2 pr-2 text-base flex items-center">
          <span className="font-bold">
            <span id="hide"></span>
            <input id="txt" className={styles.usernameInput}></input>:
          </span>
        </div>
        <input className="flex-grow border-0 h-12 align-top outline-none p-1 pl-2 text-base w-0	min-w-0 rounded-none" id="chat"></input>
        <button id="send" className="outline-none bg-white min-w-fit" onClick={() => {
          let chat = document.getElementById("chat") as HTMLInputElement;
          //should prolly filter chat at some point xd
          sendChat(username, chatColor, chat.value);
          chat.value = "";
        }}>
          <img src="/right-arrow.svg" className="w-4 h-4 mr-2"/>
        </button>
        </div>

        <div className="basis-8 p-4">
            <div className="p-4 py-2 sm:pt-0 sm:pb-4 basis-8 grow-0 shrink-0 text-black text-center text-3xl sm:text-4xl font-bold">
              Set {setCount}, Attempt {attemptCount}
            </div>

          </div>
          <div className="basis-4/5 grow p-4">
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
            }}>I found 24!</button>
          </div>

          <div className="text-xs basis-8 mx-auto mt-2 p-4 pt-0" id="instructions">
            <strong>Instructions:</strong> For each round, enter the point values of all four cards
            with a valid mathematical combination of basic operators <code>[+, -, *, /]</code> and
            parentheses <code>[(, )]</code> which evaluates to 24. All rounds are guaranteed to be
            solvable. Submit your answer before all your opponents to win the round!&nbsp;
            <a className={styles.hideButton} onClick={() =>
              { document.getElementById("instructions").style.display = "none"; }
            }>[hide]</a>
          </div>

          <Controls username={username} />
        </div>
        </div>
        <div className={"basis-8 sticky top-0 pt-2 pl-1 pr-1 " + ( fade ? "opacity-1 transition-all duration-100 ease-in-out z-20" : "opacity-0 transition-all duration-500 ease-in-out z-20 select-none")}>
          {rounds.length > 0 ?
              <HistoryInfo {...rounds[rounds.length - 1]}/> : null }
        </div>
      </main>
  );
}
