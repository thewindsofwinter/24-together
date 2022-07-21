import Card from '../components/card'
import styles from '../styles/HistoryInfo.module.css'

export interface RoundInfo {
  values: CardType[];
  color: number;
  message: string;
  query: string;
}

export default function HistoryInfo(props: RoundInfo) {
  switch(props.data.color) {
    case 0:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.data.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()}></Card>
          ))}</div>
          <p>Query: "{props.data.query}"</p>
          <p>{props.data.message}</p>
        </div>
      );
      break;
    default:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.data.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()}></Card>
          ))}</div>
          <p className="text-red-700">Query: "{props.data.query}"</p>
          <p className="text-red-700">{props.data.message}</p>
        </div>
      );
      break;
  }

}
