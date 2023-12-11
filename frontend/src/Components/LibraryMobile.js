import React, { useRef, useEffect } from 'react';
import styles from '../CSS/LibraryMobile.module.css';
import styled from 'styled-components';

const StyledContainer = styled.div`
  ${props => props.dynamicStyles}
`;


const LibraryMobile = ({addBlockTask, toggleMenu, setHtml, setCss, setJs, askPatText, setAskPatText, givePatterns, popularPatterns, 
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
            css={pattern.css}
            setCss={setCss}
            js={pattern.js}
            setJs={setJs}
            unlikePattern={unlikePattern}
            likePattern={likePattern}
            deletePattern={deletePattern}
            addBlockTask={addBlockTask}
            name={name}
          />)}
      </div>
      </div>
  );
};

const Pattern = ({addBlockTask, toggleMenu, id, content, likes, patLikes, html, setHtml, css, setCss, js, setJs, 
  unlikePattern, likePattern, deletePattern, author, name}) => {
  
  return (
      <div className={styles.pattern}>
        {name === author &&
         <button className={styles.button3} onClick={() => {deletePattern(id)}}>Удалить</button>}
        <div className={styles.button_row}>

              <button className={styles.button1} onClick={() => {
                addBlockTask(html, js, css);
                toggleMenu();
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

        <StyledContainer 
                    dynamicStyles={css}
                    className={styles.square_block}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </StyledContainer>

      </div>
  );
}


export default LibraryMobile;
