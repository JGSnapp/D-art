import React, { useState, useEffect, useMemo } from 'react';
import styles from '../CSS/GPT.module.css';
import styles2 from '../CSS/AnimatedSquare.module.css';
import axios from 'axios';

const AnimatedSquare = () => {

  return (
    <div
      style={{
        width: '42px',
        height: '42px',
        zIndex: 5,
      }}
    >
 <div className={styles2.progress1}/>
 <div className={styles2.progress2}/>
 <div className={styles2.progress3}/>
    </div>
  );
};

const GPT = ({addBlock, html, setHtml, toggleMenu}) => {
  const [message, setProp] = useState('');
  const [load, setLoad] = useState(false);

  const handleTry = async e => {
    setLoad(true);
    e.preventDefault();
    try {
      //const res = await axios.post('http://77.232.128.152:8080/register', {
    const res = await axios.post('http://192.168.0.117:5000/chat',
     { message: message },
     { method: 'POST' });
      setHtml(res.data.response);
    } catch (err) {
      console.error(err);
    }
    setLoad(false);
  };
    return (
        <div className={styles.container}>
          <div className={styles.center_content}>
            <div className={styles.square} style={load ? {
                justifyContent: 'center',
                alignItems: 'center',
            } : {}}>
                {load ? <div/> :
                  <div dangerouslySetInnerHTML={{ __html: html }} />}
            </div>
            <form onSubmit={handleTry} className={styles.vvod}>
              <input className={styles.input} value={message} type="text" onChange={e => setProp(e.target.value)} placeholder="Напишите, что вы хотите создать" />
              <button className={styles.bqq}>Ввод</button>
            </form>
            <button className={styles.bqq2} onClick={()=>{
                addBlock();
                toggleMenu();
              }}>Добавить</button>
          </div>
        </div>
    );    
}

export default GPT;
