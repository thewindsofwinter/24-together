import Card, { CardType } from '../components/card'
import styles from '../styles/HistoryInfo.module.css'

export interface RoundInfo {
  values: CardType[];
  color: number;
  message: string;
  query: string;
  label: string;
}

export default function HistoryInfo(props: RoundInfo) {
    if (props.label == "Chat") {
        return (
            <div className="bg-green-200 p-2 rounded-lg drop-shadow-md m-1">
                <p className="font-bold text-xl text-green-900 m-1">{props.label}</p>

                <p className="text-green-500">{props.query}</p>
                <p className="text-green-500">{props.message}</p>
            </div>);
    }
  switch(props.color) {
    case 0:
      return (
          <div className="bg-green-200 p-2 rounded-lg drop-shadow-md m-1">
              <p className="font-bold text-xl text-green-900 m-1">{props.label}</p>
              <div className="flex flex-wrap w-full my-2">{props.values.map((card, index) => (
                  <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
              ))}</div>
              <p className="text-green-500">{props.query}</p>
              <p className="text-green-500">{props.message}</p>
          </div>
      );
      break;
    case 1:
      return (
          <div className="bg-red-200 p-2 rounded-lg drop-shadow-md m-1">
              <p className="font-bold text-xl text-red-900 m-1">{props.label}</p>
              <div className="flex flex-wrap w-full my-2">{props.values.map((card, index) => (
                  <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
              ))}</div>
              <p className="text-red-500 text-sm">{props.query}</p>
              <p className="text-red-500 text-sm">{props.message}</p>
          </div>
      );
      break;
    default:
      return (
        <div className="bg-yellow-200 p-2 rounded-lg drop-shadow-md m-1">
            <p className="font-bold text-xl text-yellow-900 m-1">{props.label}</p>
          <div className="flex flex-wrap w-full my-2">{props.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p className="text-yellow-700 text-sm">{props.query}</p>
          <p className="text-yellow-700 text-sm">{props.message}</p>
        </div>
      );
      break;
  }

}
