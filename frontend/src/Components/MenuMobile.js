import styles from '../CSS/MenuMobile.module.css';
import React, { useState, useEffect } from 'react';
import ChooseMethodMobile from './ChooseMethodMobile';
import GPT from './GPT.js'
import Advanced from './Advanced.js';
import Library from './LibraryMobile.js'
import AddZone from './AddZone.js';

const MenuMobile = ({ addBlockTask, toggleMenu, isMenuOpen, addBlock, html, setHtml, css, setCss, js, setJs, patText, 
    setPatText, askPatText, setAskPatText, givePatterns, popularPatterns, deletePattern, addPattern, 
    likes, setLikes, patterns, likePattern, unlikePattern, name, addZone, zone, setZone }) => {
    const [type, setType] = useState(0);

    useEffect(() => {
        setHtml('');
        setCss('');
        setJs('');
    }, [type]);

    return(
        <div className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
            <div className={styles.cent}>
            <div className={styles.txt} >Добавить область</div>
            <AddZone 
                addZone={addZone}
                zone={zone}
                setZone={setZone}/>
            <div className={styles.txt} >Добавить блок</div>
            <ChooseMethodMobile setType={setType}></ChooseMethodMobile>
            {type==1 && <GPT
                addBlock={addBlock} 
                html={html} setHtml={setHtml}
                toggleMenu={toggleMenu}
                />}
            {type==2 && <Advanced 
                        addBlock={addBlock} 
                        html={html} setHtml={setHtml}
                        css={css} setCss={setCss}
                        js={js} setJs={setJs} 
                        addPattern={addPattern}
                        patText={patText} setPatText={setPatText}
                        toggleMenu={toggleMenu}
                        />}
            </div>
            {type==0 && <Library 
                        addBlockTask={addBlockTask}
                        html={html} setHtml={setHtml}
                        css={css} setCss={setCss}
                        js={js} setJs={setJs} 
                        patterns={patterns}
                        likes={likes} SetLikes={setLikes}
                        patText={patText} setPatText={setPatText}
                        askPatText={askPatText} setAskPatText={setAskPatText}
                        deletePattern={deletePattern}
                        givePatterns={givePatterns}
                        popularPatterns={popularPatterns}
                        likePattern={likePattern}
                        unlikePattern={unlikePattern}
                        name={name} toggleMenu={toggleMenu}/>}
        </div>
    );
}

export default MenuMobile;