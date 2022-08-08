
import styles from '../styles/HistoryInfo.module.css'

export interface MessageInfo {
    tag: string;
    color: string;
    message: string;
}

export default function ChatMessage(props: MessageInfo) {

    return (
      <div>
          <p className={`font-bold ${props.color}`}>{props.tag} <span className="inline font-normal text-gray-900">{props.message}</span></p>

      </div>
    );

}
