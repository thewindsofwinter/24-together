import Card from '../components/card'
import styles from '../styles/HistoryInfo.module.css'

interface RoundInfo {
  values: CardType[];
  color: number;
  message: string;
  query: string;
}

export default function HistoryInfo(props: RoundInfo) {
  return (
    <div className="historyBox">
      <div className="flex flex-wrap -mb-4 -mx-2 w-full">{props.data.values.map((card, index) => (
        <Card suit={card.suit} val={card.value} key={"card" + index.toString()}></Card>
      ))}</div>
      <p>{props.data.query}</p>
      <p>{props.data.message}</p>
    </div>
  );
}
