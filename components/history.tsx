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
  switch(props.color) {
    case 0:
      return (
          <div className="bg-green-200 p-1 rounded-md">
              <p className="font-bold text-base text-green-900">{props.label}</p>
              <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
                  <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
              ))}</div>
              <p className="text-green-500">{props.query}</p>
              <p className="text-green-500">{props.message}</p>
          </div>
      );
      break;
    case 1:
      return (
          <div className="bg-red-200 p-1 rounded-md">
              <p className="font-bold text-base text-red-900">{props.label}</p>
              <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
                  <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
              ))}</div>
              <p className="text-red-500">{props.query}</p>
              <p className="text-red-500">{props.message}</p>
          </div>
      );
      break;
    default:
      return (
        <div className="bg-yellow-200 p-1 rounded-md">
            <p className="font-bold text-base text-yellow-900">{props.label}</p>
          <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p className="text-yellow-700">{props.query}</p>
          <p className="text-yellow-700">{props.message}</p>
        </div>
      );
      break;
  }

}
