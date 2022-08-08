import React from "react";
import styles from '../styles/Timer.module.css'

type Props = {
    time: number
}

export default function Timer(props: Props) {
  return (
    <div className={styles.timer}>
      <img className="w-8 h-8 inline-block mx-2 pb-0.5" src="/timer-icon.svg" />
      <span className={styles.digits}>
        {("0" + Math.floor((props.time / 60000) % 60)).slice(-2)}:
      </span>
      <span className={styles.digits}>
        {("0" + Math.floor((props.time / 1000) % 60)).slice(-2)}.
      </span>
      <span className={styles.digits + ' ' + styles.millisec}>
        {("0" + ((props.time / 10) % 100)).slice(-2)}
      </span>
    </div>
  );
}
