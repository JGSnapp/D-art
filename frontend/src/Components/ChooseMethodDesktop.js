import React, { useState, useRef } from 'react';
import styles from '../CSS/ChooseMethodDesktop.module.css';

const ChooseMethodDesktop = ({setType}) => {
  const [pos, setPos] = useState(styles.pos1);
  const isAnimatingRef = useRef(false);

  const handleClick = (newPos, index) => {
    if (!isAnimatingRef.current) {
      isAnimatingRef.current = true;
      setPos(newPos);
      setType(index);

      // Задержка перед снятием флага анимации
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 301); // Время анимации
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: ' rgb(99, 97, 97)',
        display: 'flex',
        margin: '10px',
        height: '40px',
        width: '300px',
        borderRadius: '15px',
      }}
    >
      <div className={`${styles.clr} ${pos}`}></div>
      <button className={styles.b} onClick={() => handleClick(styles.pos1, 0)}>
        Библиотека
      </button>
      <button className={styles.b} onClick={() => handleClick(styles.pos2, 1)}>
        GPT
      </button>
      <button className={styles.b} onClick={() => handleClick(styles.pos3, 2)}>
        Code
      </button>
    </div>
  );
};

export default ChooseMethodDesktop;
