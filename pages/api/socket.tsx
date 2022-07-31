import { Server } from "socket.io";
import React, { useEffect, useState, useCallback } from 'react';
import mexp from 'math-expression-evaluator'
import Card, { CardType } from '../components/card'

export default function SocketHandler(req, res) {
  let cards = getRandomCards();

  // It means that socket server was already initialised
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const onConnection = (socket) => {
    const getCards = (msg) => {
      socket.broadcast.emit("currentCards", { cards: cards });
    };

    const evaluateGuess = (msg) => {
      let evaluatedGuess = verifyOperations(msg.input, cards).split('-');

      if(evaluatedGuess[0] === "correct") {
        cards = getRandomCards();
        socket.broadcast.emit("guessEvaluation",
          { sender: msg.author, guess: msg.input, evaluation: "Correct!", cards: cards });
      }
      else if(evaluatedGuess[0] === "incorrect") {
        socket.broadcast.emit("guessEvaluation",
          { sender: msg.author, guess: msg.input, evaluation: "Incorrect!", cards: cards });
      }
      else {
        socket.broadcast.emit("guessEvaluation",
          { sender: msg.author, guess: msg.input, evaluation: "Invalid: " + evaluatedGuess[1], cards: cards });
      }
    }

    socket.on("getCards", getCards);
    socket.on("sendGuess", evaluateGuess);
  };

  // Define actions inside
  io.on("connection", onConnection);

  console.log("Setting up socket");
  res.end();
}

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
