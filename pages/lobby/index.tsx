import Head from 'next/head'
import Pusher from 'pusher-js'
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from '../../styles/Home.module.css'

import Timer from '../../components/timer'
import Card, { CardType } from '../../components/card'
import GameCard, { GameInfo } from '../../components/game-card'
import HistoryInfo, { RoundInfo } from '../../components/history'
import Controls, { updateCardDB } from '../../components/controls'
import ChatMessage, { MessageInfo } from '../../components/chat'
import GameModal from '../../components/create-game'



const chatColor = ['text-red-600', 'text-green-600', 'text-blue-600', 'text-pink-400', 'text-purple-700'][Math.floor(Math.random() * 5)]

export function resize(hide: HTMLElement, txt: HTMLInputElement) {
    hide.textContent = txt.value;
    txt.style.width = (hide.offsetWidth + 1) + "px";
}

export function sendChat(username: string, color: string, msg: string) {
    let chatMsg = {
        tag: username + ":",
        color: color,
        message: msg,

    }
    console.log("CHAT MESSAGE: " + chatMsg.message);

    fetch("/api/pusher-chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(chatMsg),
    });
}

export function sendUsernameChange(oldUsername: string, color: string, newUsername: string) {
    if (oldUsername == newUsername) {
        return;
    }
    let chatMsg = {
        tag: oldUsername,
        color: color,
        message: "set their username to \'" + newUsername + "\'",

    }
    console.log("CHAT MESSAGE: " + chatMsg.message);

    fetch("/api/pusher-chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(chatMsg),
    });
}




export default function Lobby() {
    const [username, setUsername] = useState<string>("birb");
    const [lobbyGames, setLobbyGames] = useState<GameInfo[]>([]);
    const [chatMsgs, setChatMsgs] = useState<MessageInfo[]>([]);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    // Might make this a toggle button

    const scrollBottomRef = useRef(null);
    const scrollToBottom = () => {
        scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [chatMsgs]);


    // head off hydration problem
    useEffect(() => {
        // Get the input field

        var chat = document.getElementById("chat");
        // Execute a function when the user presses a key on the keyboard

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


        setChatMsgs([{
            tag: "[INFO]",
            color: "text-black",
            message: "Welcome, birb-" + suffix + "!",
        } as MessageInfo]);

        setLobbyGames([{
            values: [
                {suit: "clubs",
                value: 2} as CardType,
                {suit: "diamonds",
                    value: 3} as CardType,
                {suit: "hearts",
                    value: 11} as CardType,
                {suit: "spades",
                    value: 1} as CardType,

            ],
            title: "very's super awesome game",
            round: 11,
            host: "very",
            locked: true,
            playerCount: 2,
        } as GameInfo,
            {
                values: [
                    {suit: "clubs",
                        value: 2} as CardType,
                    {suit: "diamonds",
                        value: 3} as CardType,
                    {suit: "hearts",
                        value: 11} as CardType,
                    {suit: "spades",
                        value: 1} as CardType,

                ],
                title: "andy's super oars game",
                round: 11,
                host: "andy",
                locked: false,
                playerCount: 2,
            } as GameInfo,
        ]);


        // Only need to do this at the start
        console.log("getting round data from firebase")



        const pusher = new Pusher(process.env.NEXT_PUBLIC_API_KEY, {
            cluster: process.env.NEXT_PUBLIC_CLUSTER,
        });

        const hist_channel = pusher.subscribe('history');



        hist_channel.bind('send-chat', function(data) {
            let messageData = data as MessageInfo;
            console.log(messageData);


            setChatMsgs((chatMsgs) => {

                return [...chatMsgs, messageData]; });

        });






    }, [])

    return (
        <div className={styles.container}>
            <Head>
                <title>24 | Multiplayer Game</title>
                <link rel="icon" href="/public/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}><span className={styles.accent}>Play 24</span> Together</h1>
                <div className={styles.wrapper}>

                    {/*player/chat*/}
                    <div className="basis-1/5 bg-accent rounded-l-2xl flex flex-col bg-gray-50">
                        <div className="basis-8 grow-0 shrink-0 text-center font-black text-teal-900 bg-gray-300 text-2xl py-6 p-4 rounded-tl-xl">
                            Global Chat
                        </div>
                        <div className="basis-8 grow shrink overflow-auto space-y-1 pl-2 pb-1">
                            {chatMsgs.map((chat, index) => (
                                <ChatMessage key={"message-" + index.toString()}
                                             {...chat}/>
                            ))}
                            <div id="scroll-to-bottom" className="float-left clear-both" ref={scrollBottomRef}/>
                        </div>
                        <div className="flex flex-row border-2 rounded-bl-xl border-gray-300 bg-gray-300">
                            <div className="min-w-fit bg-none pl-2 pr-2 text-base flex items-center">
              <span className="font-bold">
                <span id="hide"></span>
                <input id="txt" className={styles.usernameInput}></input>:
              </span>
                            </div>
                            <input className="flex-grow border-0 h-12 align-top outline-none p-1 pl-2 text-base w-0	min-w-0" id="chat"></input>
                            <button id="send" className="outline-none bg-white min-w-fit" onClick={() => {
                                let chat = document.getElementById("chat") as HTMLInputElement;
                                //should prolly filter chat at some point xd
                                sendChat(username, chatColor, chat.value);
                                chat.value = "";
                            }}>
                                <img src="/right-arrow.svg" className="w-4 h-4 mr-2"/>
                            </button>



                        </div>
                    </div>


                    <div className="basis-4/5 flex flex-col">

                        <div className="basis-8">




                            <div className="basis-8 grow-0 shrink-0 text-center font-black text-white bg-green-800 text-2xl py-6 rounded-tr-xl">
                                Lobby
                            </div>

                            <div className="flex items-center justify-start px-3 py-2">

                            <input
                                className="form-control px-3 py-1.5 text-base font-normal text-gray-700 m-3
                                bg-white border border-solid border-gray-300 rounded transition
                                ease-in-out focus:text-gray-700 focus:bg-white focus:border-green-600 focus:outline-none"
                                id="filterSearch"
                                placeholder="Filter games"
                                value={filter}
                                onChange={event => setFilter(event.target.value)}
                            />
                                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded ml-auto" onClick={handleShow}>
                                    Create New
                                </button>
                            </div>
                            <div className="p-4 grid grid-cols-4 gap-4 overflow-y-auto ">
                                {lobbyGames.filter(f => f.title.includes(filter) || filter === '')
                                    .map((game, index) => (
                                    <GameCard key={"game-" + index.toString()}
                                                 {...game}/>
                                ))}
                            </div>
                        </div>





                    </div>
                    {/*timer/history*/}

                </div>
            </main>
            {
                showModal && <GameModal/>
            }
        </div>
    )
}
