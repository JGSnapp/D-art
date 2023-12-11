import React, { useState } from 'react';
import axios from 'axios';
import myImage from '../images/full.png';
import styles from '../CSS/Register.module.css';

function Register({ setReg }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async e => {
    e.preventDefault();
    try {
    const res = await axios.post('http://192.168.0.117:8080/register', {
        username,
        password,
      });
      setReg(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.outer_container}>
      <div className={styles.inner_container}>
      <img className={styles.logo} src={myImage} alt="" />
      <form className={styles.form} onSubmit={handleRegister}>
        <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="Имя" required />
        <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
        <button className={styles.button}>Зарегистрироваться</button>
      </form>
      <span className={styles.sign} onClick={() => setReg(false)}>Уже есть аккаунт? Войти</span>
    </div>
    </div>
  );
}

export default Register;
