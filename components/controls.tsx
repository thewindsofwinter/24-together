import styles from '../styles/Controls.module.css'
import React, { useEffect, useState, useCallback, useRef } from 'react';
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

export async function getRandomCards(): Promise<CardType[]> {
  const suits = ["spades", "hearts", "diamonds", "clubs"];
  let unsolvable = true;
  let fourCards = [] as CardType[];

  while(unsolvable) {
    fourCards = []
    for(var i = 0; i < 4; i++) {
      fourCards.push({
        suit: suits[Math.floor(Math.random() * 4)],
        value: Math.ceil(Math.random() * 13)
      });
    }

    // console.log(fourCards)
    unsolvable = await isUnsolvable(getCardsSorted(fourCards));
    // console.log(unsolvable)
  }

  return fourCards;
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

export async function isUnsolvable(sortedCards: number[]): Promise<boolean> {
  let val = await fetch('unsolvable.txt')
  .then(response => response.text())
  .then(text => {
    let str = text.split(/\r?\n/);
    let foundMatch = false;
    // console.log(str[0].split(" "));
    str.forEach(element => {
      let tokens = element.split(" ");
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
      // console.log(ok)

      if(ok) {
        // console.log(ok + " " + sortedCards + " " + tokens)
        foundMatch = true;
      }
    });

    return foundMatch;
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

export default function Controls(props: string) {
  return (
    <div className={styles.controls}>
      <div className={styles.newGame} onClick={() => { newGame(props.username); }}>
        New Game
      </div>
      <div className={styles.nextSet} onClick={() => { nextRound(props.username); }}>
        Next Set
      </div>
    </div>
  )
}
