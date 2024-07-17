import styles from '../CSS/MenuDesktop.module.css';
import React, { useState, useEffect } from 'react';
import ChooseMethodDesktop from './ChooseMethodDesktop';
import Advanced from './Advanced.js';
import LibraryDesktop from './LibraryDesktop.js'
import AddZone from './AddZone.js';

const MenuDesktop = ({ tags, setTags, addBlockTask, toggleMenu, isMenuOpen, addBlock, html, setHtml, patText, 
    setPatText, askPatText, setAskPatText, givePatterns, popularPatterns, deletePattern, addPattern,
    likes, setLikes, patterns, likePattern, unlikePattern, name, addZone, zone, setZone, windowWidth, color1, color2 }) => {
        const [type, setType] = useState(0);

        useEffect(() => {
            console.log(windowWidth);
        }, [windowWidth]);

        useEffect(() => {
            setHtml('');
        }, [type]);

        return(
            <div className={`${styles.menu} ${isMenuOpen ? windowWidth : ''}`}>
                <div className={styles.cent}>
                <div className={styles.txt} >Добавить область</div>
                <AddZone 
                addZone={addZone}
                zone={zone}
                setZone={setZone}
                color1={color1}
                color2={color2}
                tags={tags}
                setTags={setTags}/>
                <div className={styles.txt} >Добавить блок</div>
                <ChooseMethodDesktop
            setType={setType}
            color1={color1}
            color2={color2} />
                {type==2 && <Advanced 
                            addBlock={addBlock} 
                            html={html} setHtml={setHtml}
                            addPattern={addPattern}
                            patText={patText} setPatText={setPatText}
                            toggleMenu={toggleMenu}
                            color1={color1}
                            color2={color2}
                            />}
                </div>
                {type==0 && <LibraryDesktop 
                            addBlockTask={addBlockTask}
                            html={html} setHtml={setHtml}
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

export default MenuDesktop;