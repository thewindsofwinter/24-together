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
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p>Query: &quot;{props.data.query}&quot;</p>
          <p>{props.data.message}</p>
        </div>
      );
      break;
    default:
      return (
        <div className={styles.historyBox}>
          <div className="flex flex-wrap w-full">{props.data.values.map((card, index) => (
            <Card suit={card.suit} val={card.value} key={"card" + index.toString()} small={true}></Card>
          ))}</div>
          <p className="text-red-700">Query: &quot;{props.data.query}&quot;</p>
          <p className="text-red-700">{props.data.message}</p>
        </div>
      );
      break;
  }

}
