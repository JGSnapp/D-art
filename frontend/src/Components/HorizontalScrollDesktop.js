import React, { useRef } from 'react';
import styles from '../CSS/HorizontalScrollDesktop.module.css';
import UpProfileDesktop from './UpProfileDesktop.js';

const HorizontalScrollDesktop = ({zones, subZones, leave, tp}) => {
  const containerRef = useRef(null);

  const handleWheel = (e) => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
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

export default HorizontalScrollDesktop;
