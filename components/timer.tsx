import React from "react";
import styles from '../styles/timer.module.css'

export default function Timer(props) {
  return (
    <div className={styles.timer}>
      <span className={styles.digits}>
        {("0" + Math.floor((props.time / 60000) % 60)).slice(-2)}:
      </span>
      <span className={styles.digits}>
        {("0" + Math.floor((props.time / 1000) % 60)).slice(-2)}.
      </span>
      <span className={styles.digits styles.millisec}>
        {("0" + ((props.time / 10) % 100)).slice(-2)}
      </span>
    </div>
  );
