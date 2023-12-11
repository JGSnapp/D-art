import React, { useState, useEffect } from 'react';
import axios from 'axios';
import myImage from '../images/full.png';
import styles from '../CSS/Login.module.css';

function Login({ setJwt, setReg, setName }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async e => {
    e.preventDefault();
    try {
      //const res = await axios.post('http://77.232.128.152:8080/login', {
      const res = await axios.post('http://192.168.0.117:8080/login', {
        username,
        password,
      });
      setJwt(res.data.token);
      setName(username);
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      console.log(res.data.token)
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin2 = async (storedUsername, storedPassword) => {
    try {
      //const res = await axios.post('http://77.232.128.152:8080/login', {
      const res = await axios.post('http://192.168.0.117:8080/login', {
        username: storedUsername,
        password: storedPassword,
      });
      setJwt(res.data.token);
      setName(storedUsername);
      console.log(res.data.token)
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (storedUsername && storedPassword) {
      handleLogin2(storedUsername, storedPassword);
    }
  }, []);

  return (
    <div className={styles.outer_container}>
      <div className={styles.inner_container}>
      <img className={styles.logo} src={myImage} alt="" />
      <form className={styles.form} onSubmit={handleLogin}>
        <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="Имя" required />
        <input className={styles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" required />
        <button className={styles.button}>Войти</button>
      </form>
      <span className={styles.sign} onClick={() => setReg(true)}>Нет аккаунта? Зарегистрироваться</span>
    </div>
    </div>
  );
}

export default Login;
