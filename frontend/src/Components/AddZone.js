import React from 'react';
import styles from '../CSS/AddZone.module.css';

const AddZone = ({ addZone, zone, setZone}) => {

  const handleZoneCreate = async e => {
    e.preventDefault();
    try {
      addZone();
    } catch (err) {
      console.error(err);
    }
  };

  return (
      <form  className={styles.vvod} onSubmit={handleZoneCreate}>
        <input className={styles.input}  value={zone} onChange={event => setZone(event.target.value)} placeholder="Название области" required />
        <button className={styles.bqq}> + </button>
      </form>
  );
}

export default AddZone;
