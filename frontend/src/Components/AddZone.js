import React, { useState } from 'react';
import styles from '../CSS/AddZone.module.css';

const WordList = ({ words, removeWord }) => {
  return (
    <div>
      {!(words === undefined || words === null) && (
        <div className={styles.cont}>
          {words.map((word, index) => (
            <div key={index} className={styles.wordStyle}>
              <span>{word}</span>
              <button onClick={() => removeWord(index)} className={styles.buttonStyle}>
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddZone = ({ addZone, zone, setZone, color1, color2, tags, setTags }) => {
  const [inputWord, setInputWord] = useState('');

  const addWord =  async (e) => {
    e.preventDefault();
    try {
    if (inputWord && tags.length < 6) {
      setTags([...tags, inputWord]);
      setInputWord('');
    }
  } catch (err) {
    console.error(err);
  }
  };

  const removeWord = (index) => {
    const newWords = [...tags];
    newWords.splice(index, 1);
    setTags(newWords);
  };

  const handleZoneCreate = async (e) => {
    e.preventDefault();
    try {
      addZone();
      setTags([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.menu} onSubmit={handleZoneCreate}>
        <input
          className={styles.input}
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          placeholder="Название области"
          required
        />
        <button
          className={styles.bqq}
          style={{ backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})` }}
        >
          +
        </button>
        </form>
        <form className={styles.menu} onSubmit={addWord}>
        <input
          type="text"
          value={inputWord}
          placeholder="Добавьте теги"
          onChange={(e) => setInputWord(e.target.value)}
          className={styles.input}
        />
        <button
        className={styles.bqq}
        style={{ backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})` }}>
          +тег
        </button>
      </form>
      <WordList words={tags} removeWord={removeWord} />
    </div>
  );
};

export default AddZone;
