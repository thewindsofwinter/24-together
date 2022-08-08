import Card, { CardType } from '../components/card'
import styles from '../styles/HistoryInfo.module.css'
import React from "react";

export interface GameInfo {
    values: CardType[];
    title: string;
    round: number;
    host: string;
    playerCount: number;
    locked: boolean;
}

export default function GameCard(props: GameInfo) {
    return (
        <div className="bg-green-200 p-2 rounded-lg drop-shadow-md m-1">
            <img src={props.locked ? "/lock-icon.svg" : "/unlock-icon.svg"}
                 className="w-5 h-5 float-right m-2"/>
            <p className="font-bold text-xl text-green-900 m-1">{props.title}</p>

            <p className="text-green-700 text-sm">Round {props.round}, Attempt 2</p>
            <div className="flex flex-wrap w-full my-3">{props.values.map((card, index) => (
                <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
            ))}</div>

            <p className="text-green-700 text-sm">Created by <span className="font-bold">{props.host}</span></p>
            <div className="flex items-center justify-start">

                    <img className="w-4 h-4 m-2 mr-1" src="/person-icon.svg" /> <span>{props.playerCount}</span>
                {
                    props.locked ?
                        <button className="bg-green-600 text-white font-bold py-2 px-4 m-2 rounded ml-auto opacity-50 cursor-not-allowed">
                            Join
                        </button>
                        :
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded ml-auto">
                            Join
                        </button>
                }

            </div>

        </div>
    );


}
