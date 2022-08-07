import React from "react";
// import club from '../public/card-assets/club.svg';
// import diamond from '../public/card-assets/diamond.svg';
// import heart from '../public/card-assets/heart.svg';
// import spade from '../public/card-assets/heart.svg';


type Props = {
    val: number
    suit: string
    small: boolean
}


export interface CardType {
  suit: string;
  value: number;
}

const card = ({ val, suit, small }: Props) => {
    if (small) {
        var cardIcon=<img className="block rounded-md aspect-[2/3] object-contain bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg" src={"/card-assets/" + suit+ val.toString() + ".svg" }/ >;
            }
    else {
    var cardIcon=<img className="block rounded-md sm:rounded-lg md:rounded-2xl aspect-[2/3] object-contain bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg" src={"/card-assets/" + suit+ val.toString() + ".svg" }/ >
                }


    return (
        <div
            className="p-[1%] w-1/4">
            {cardIcon}
        </div>
    )
}

export default card;
