//App.js
import React, { useState, useRef } from 'react';
import Login from './Login';
import Chat from './Chat';
import Register from './Register'
import styles from '../CSS/App.module.css';

function App() {
  const [jwt, setJwt] = useState('');
  const [reg, setReg] = useState(false);
  const name = useRef('');
  return(
    <div className={styles.all}>
      {jwt === '' ? 
      (reg ?  <Register className={styles.all} setReg={setReg}/> : <Login className={styles.all} setJwt={setJwt} setReg={setReg} name={name}/>)
      : <Chat  className={styles.all} jwt={jwt} name={name}/> }
    </div>
  )
}

export default App;