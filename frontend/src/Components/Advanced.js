import React, { useState, useEffect, useRef } from 'react';
import styles from '../CSS/Advanced.module.css';

const Advanced = ({toggleMenu, addBlock, html, setHtml, css, setCss, js, setJs, addPattern, patText, setPatText}) => {
  const outputRef = useRef(null);
  const AddPatt = async e => {
    e.preventDefault();
    try {
      addPattern();
      toggleMenu();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Создаем blob-объект для CSS
        const cssBlob = new Blob([css], { type: 'text/css' });
        const cssUrl = URL.createObjectURL(cssBlob);

        // Вставляем содержимое, если outputRef.current существует
        if (outputRef.current) {
          outputRef.current.innerHTML = html; // Вставляем HTML

          // Вставляем CSS через <link>
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = cssUrl;
          outputRef.current.appendChild(linkElement);
        }

        // Выполняем JS-код
        const executeJs = new Function(js);
        executeJs();

        return () => {
          URL.revokeObjectURL(cssUrl);
        };
      } catch (error) {
        console.error('Ошибка при выполнении кода:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [html, css, js]);
  
  
    return (
        <div className={styles.container}>
          <div className={styles.center_content}>
              <div className={styles.square} 
                ref={outputRef} />


            <textarea  className={styles.textarea} placeholder="HTML" value={html} onChange={event => setHtml(event.target.value)} />
            <textarea  className={styles.textarea} placeholder="CSS" value={css} onChange={event => setCss(event.target.value)} />
            <textarea  className={styles.textarea} 
            placeholder="JS (используйте %%name%% вместо имени пользователя, %%id%% вместо уникального номера и %%author%% вместо имени автора)" 
            value={js} onChange={event => setJs(event.target.value)} />
              <button className={styles.bqq} onClick={()=>{
                addBlock();
                toggleMenu();
              }}>Ввод</button>
              <form className={styles.vvod} onSubmit={AddPatt}>
                <input className={styles.input} type="text" value={patText} onChange={e => {setPatText(e.target.value)}} placeholder="Название для библиотеки" required />
                <button className={styles.bqq2} >+</button>
             </form>
          </div>
        </div>
    );    
}

export default Advanced;
