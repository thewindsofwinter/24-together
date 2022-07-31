import Card, { CardType } from '../components/card'
import styles from '../styles/HistoryInfo.module.css'

export interface RoundInfo {
  values: CardType[];
  color: number;
  message: string;
  query: string;
}

export default function HistoryInfo(props: RoundInfo) {
  switch(props.color) {
    case 0:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p>{props.query}</p>
          <p>{props.message}</p>
        </div>
      );
      break;
    case 1:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p className="text-red-700">{props.query}</p>
          <p className="text-red-700">{props.message}</p>
        </div>
      );
      break;
    default:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p className="text-yellow-500">{props.query}</p>
          <p className="text-yellow-500">{props.message}</p>
        </div>
      );
      break;
  }

}
