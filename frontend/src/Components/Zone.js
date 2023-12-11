import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import styles from '../CSS/Zone.module.css';
import { HexColorPicker } from "react-colorful";

const Zone = ({ 
    coords, content, isEdit, id, width, height, room, author, name, subZones,
    removeZone, moveZone, moveZoneTo, subZone, leaveZone,
    CHUNKSIZE, startcolor, updateColor, updateFile, ready, scaleRef
}) => {
    const blockRef = useRef(null);
    const firstRenderRef = useRef(true);
    const [color, setColor] = useState(`${startcolor}`);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [imgShow, setImgShow] = useState(true);

    const shouldInteract = () => isEdit && !isMenuOpen && author === name;

    const roomsAreEqual = (room1, room2) => {
      return room1.x === room2.x && room1.y === room2.y;
  };

  useEffect(() => {
    if (firstRenderRef.current) {
        // Skip updateColor on first render
        firstRenderRef.current = false;
    } else {
        updateColor(id, color, room);
        console.log(id); // Call updateColor on subsequent renders when color changes
    }
}, [color]);

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    updateFile(id, file, event.target.name); // Вызываем функцию, переданную из родительского компонента
    setTimeout(() => {
        setImgShow(true);
      }, 1000);
  }
};


    useEffect(() => {
        if (!blockRef.current) return;

        const target = blockRef.current;

        interact(target)
            .draggable({
                listeners: {
                    move: event => {
                        if(isMenuOpen){ready.current = false;}
                        if (!shouldInteract()) return;
                        ready.current = false;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx / scaleRef.current;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy / scaleRef.current;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end: event => {
                        if (!shouldInteract()) return;
                        const x = parseFloat(target.getAttribute('data-x')) || 0;
                        const y = parseFloat(target.getAttribute('data-y')) || 0;
                        let newRoom = {
                            x: Math.floor(x / CHUNKSIZE),
                            y: Math.floor(y / CHUNKSIZE)
                        };
                        if (roomsAreEqual(newRoom, room)) {
                            moveZone(id, { x, y }, content, width, height, newRoom);
                        } else {
                            moveZoneTo(id, { x, y }, content, width, height, newRoom, room);
                        }
                        ready.current = true;
                    }
                },
                inertia: true
            })
            .resizable({
                edges: { right: true, bottom: true },
                restrictSize: {
                    min: { width: 200 * scaleRef.current, height: 200 * scaleRef.current },   // Minimum dimensions
                    max: { width: 1200 * scaleRef.current, height: 1200 * scaleRef.current }    // Maximum dimensions
                },
                listeners: {
                    move: event => {
                        if (!shouldInteract()) return;
                        ready.current = false;
                        target.style.width = `${event.rect.width / scaleRef.current}px`;
                        target.style.height = `${event.rect.height / scaleRef.current}px`;
                    },
                    end: event => {
                        if (!shouldInteract()) return;
                      moveZone(id, {x: parseFloat(target.getAttribute('data-x')), y: parseFloat(target.getAttribute('data-y'))},content, event.rect.width / scaleRef.current, event.rect.height / scaleRef.current, room);
                      ready.current = true;
                    }
                },
                inertia: true
            });
    }, [isEdit, author, name, id, room, content, width, height, moveZone, moveZoneTo, roomsAreEqual]);

    return (
      <div 
          ref={blockRef} 
          className={styles.block}
          style={{
            transform: `translate(${coords.x}px, ${coords.y}px)`,
            position: 'absolute',
            width:`${width}px`,
            height:`${height}px`,
            borderRadius: 10,
            backgroundColor: color, // используйте переменную color,
            zIndex: !isMenuOpen ? ((isEdit && author !== name) ? 10 : 0) : 10,
          }}
          data-x={coords.x} 
          data-y={coords.y}
      >

            { imgShow && <img src={`http://192.168.0.117:8080/images/${id}`} 
            alt="" 
            onError={() => {
                setImgShow(false)
                console.log('aaaaaaa');
            }}
            style={{                
                position: 'absolute',
                top: 0,
                left: 0,
                width: `100%`,
                height: `100%`,
                objectFit: 'cover'}}/>}

<div className={`${styles.menu} ${isMenuOpen ? styles.open : ''}`}>
        <h2 className={styles.max_text}>Настройки</h2>
        <h1 className={styles.text}>Цвет области</h1>
            <div className={styles.colour_picker}>
            <HexColorPicker color={color} onChange={setColor} />
            </div>
            <h1 className={styles.text}>Аватар области</h1>
            <label className={styles.upload}>
                <span>Загрузить</span>
                <input
                    type="file"
                    name="ava"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </label>  
            <h1 className={styles.text}>Задний фон области</h1>
            <label className={styles.upload}>
                <span>Загрузить</span>
                <input
                    type="file"
                    name="image"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </label>
            <button  className={styles.Xbutton1} onClick={() => removeZone(id, room)}> Удалить </button>
            <button  className={styles.Xbutton} onClick={() => {
                setIsMenuOpen(false);
                }}> Закрыть </button>
        </div>
        {id == '.settings' && 
        <div className={styles.settings}>
                <div className={styles.max_text}>Настройки</div>
                <button  className={styles.Xbutton3} 
                onClick={() => {
                    localStorage.removeItem('password');
                    localStorage.removeItem('username');
                    window.location.reload(true);
                }}>
                     Выйти из аккаунта </button>
            </div>
              }

        <div className={styles.help}>
          <div className={styles.container_info}>
          <div className={styles.inf}>
              <div className={styles.name}> {content} </div>
              
              {id !== '.settings' &&
              (author !== name ?
                  <div>
                      {(subZones.some(zone => zone.id === id)) ?
                          <button className={styles.button} onClick={() => leaveZone(id)}> - </button>:
                          <button className={styles.button} onClick={() =>  subZone(id, room, content)}> + </button>}
                  </div>:
                  <button  className={styles.button} onClick={() => {
                    setIsMenuOpen(true);
                }}> ⚙ </button>)}
               </div>
          </div>
          </div>
      </div>
  );
}

export default Zone;