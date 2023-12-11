import React, { useRef } from 'react';
import styles from '../CSS/HorizontalScrollMobile.module.css';
import UpProfileDesktop from './UpProfileDesktop.js';

const HorizontalScrollMobile = ({zones, subZones, leave, tp}) => {
  return (
    <div
      className={styles.main}>
      {zones.map(zone => 
              <UpProfileDesktop
              key={zone.id} 
              coords={zone.coords}
              id={zone.id} 
              content = {zone.content}
              leave = {leave}
              tp = {tp}
              sub={subZones.some(subZone => subZone.id === zone.id)}
            />)}
      </div>
  );
};

export default HorizontalScrollMobile;
