import React, { useState, useEffect, useRef } from 'react';
import styles from '../CSS/Advanced.module.css';
import axios from 'axios';


const Advanced = ({toggleMenu, addBlock, html, setHtml, addPattern, patText, setPatText, color1, color2}) => {
  const [message, setProp] = useState('');
  const [load, setLoad] = useState(false);

  const handleTry = async e => {
    setLoad(true);
    e.preventDefault();
    try {
    const res = await axios.post('https://d-art.space/gpt/chat',
     { message: message },
     { method: 'POST' });
      setHtml(res.data.response);
    } catch (err) {
      console.error(err);
    }
    setLoad(false);
  };

  const AddPatt = async e => {
    e.preventDefault();
    try {
      addPattern();
      toggleMenu();
    } catch (err) {
      console.error(err);
    }
  }
  
  
    return (
        <div className={styles.container}>
          <div className={styles.center_content}>
         {load ? <div className={styles.txt} >Ждем ответ от ChatGPT...</div> : <form onSubmit={handleTry} className={styles.vvod}>
              <input className={styles.input} value={message} type="text" onChange={e => setProp(e.target.value)} placeholder="Промпт для GPT" />
              <button className={styles.bqq3}
                style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}>Ввод</button>
            </form>}
                  <iframe className={styles.square}
                  srcDoc={html}>
                  </iframe>
            <textarea  className={styles.textarea} placeholder="HTML" value={html} onChange={event => setHtml(event.target.value)} />
              <button className={styles.bqq}
                style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}} onClick={()=>{
                addBlock();
                toggleMenu();
              }}>Добавить</button>
              <form className={styles.vvod} onSubmit={AddPatt}>
                <input className={styles.input} type="text" value={patText} onChange={e => {setPatText(e.target.value)}} placeholder="Название для библиотеки" required />
                <button className={styles.bqq2} 
                  style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}>+</button>
             </form>
          </div>
        </div>
    );    
}

export default Advanced;
