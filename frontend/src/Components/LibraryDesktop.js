import React, { useRef, useEffect} from 'react';
import styles from '../CSS/LibraryDesktop.module.css';

const LibraryDesktop = ({addBlockTask, toggleMenu, setHtml, askPatText, setAskPatText, givePatterns, popularPatterns, 
  deletePattern, likes, patterns, likePattern, unlikePattern, name}) => {
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      className={styles.container}>
        <input className={styles.vvod} 
        type="text" 
        placeholder="Напишите, что вы хотите создать"
        value={askPatText} 
        onChange={e => {
            setAskPatText(e.target.value);
            if (e.target.value === "") {
                popularPatterns();
            } else {
                givePatterns(e.target.value);
            }
        }}  />
        {patterns ?
      <div    
      ref={containerRef}
      onWheel={handleWheel}
      className={styles.main}>
      {patterns.map(pattern => 
          <Pattern 
          toggleMenu={toggleMenu}
          key={pattern.id}
            id={pattern.id}
            content={pattern.content}
            likes={likes}
            patLikes={patterns.likes}
            author={pattern.author}
            html={pattern.html}
            setHtml={setHtml}
            unlikePattern={unlikePattern}
            likePattern={likePattern}
            deletePattern={deletePattern}
            name={name}
            addBlockTask={addBlockTask}
            type={pattern.type}
          />)}
      </div> : <p className={styles.text4}>ничего не найдено</p>}
      </div>
  );
};

const Pattern = ({type, addBlockTask, toggleMenu, id, content, likes, patLikes, html, setHtml, 
  unlikePattern, likePattern, deletePattern, author, name}) => {
  
  return (
      <div className={styles.pattern}>
        {name === author &&
         <button className={styles.button3} onClick={() => {deletePattern(id)}}>Удалить</button>}
        <div className={styles.button_row}>

              <button className={styles.button1} onClick={() => {
                addBlockTask(html, type);
                }}> 
              <p className={styles.text2}>{content}</p>
              от {author}   
              </button>

              <button className={styles.button2} onClick={() => {
                (likes === undefined || likes === null || !likes.some(like => like === id)) ? likePattern(id) : unlikePattern(id)}}>
              <p className={styles.text3} style={
                {color: (likes === undefined || likes === null || !likes.some(like => like === id))? "azure" :"red"}}>♥</p>
              </button>

        </div>

        <iframe
          srcDoc={html}
          className={styles.square_block}>
        </iframe>

      </div>
  );
}


export default LibraryDesktop;
