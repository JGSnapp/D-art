import React, { useState, useRef } from 'react';
import axios from 'axios';
import myImage from '../images/full.png';
import styles from '../CSS/Register.module.css';

function Register({ setReg }) {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
      try {
        await axios.post('https://d-art.space/backend/register', {
          username,
          password,
        });
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        setReg(false);
      } catch (err) {
        setError(err.toString());
      }
  };


  return (
    <div className={styles.outer_container}>
      <div className={styles.inner_container}>
        <img className={styles.logo} src={myImage} alt="" />
        <div className={styles.form}>
          <div className={styles.txt}>{error}</div>
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Имя пользователя"
          />
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
          />
           <button className={styles.button} onClick={register}>Зарегистрироваться</button>
          <span className={styles.sign} onClick={() => setReg(false)}>Уже есть аккаунт? Войти</span>
        </div>
      </div>
    </div>
  );
}

export default Register;
