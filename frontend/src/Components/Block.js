import React, { useEffect, useRef } from 'react';
import interact from 'interactjs';
import styles from '../CSS/Block.module.css';

const Block = ({
    coords, html, js, css, isEdit, id, width, height, room, author, name,
    removeBlock, moveBlock, moveBlockTo, CHUNKSIZE, ready, scaleRef
}) => {
    const blockRef = useRef(null);
    const outputRef = useRef(null);

    const roomsAreEqual = (room1, room2) => {
        return room1.x === room2.x && room1.y === room2.y;
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
          try {
            // Создаем blob-объект для CSS
            const cssBlob = new Blob([css], { type: 'text/css' });
            const cssUrl = URL.createObjectURL(cssBlob);
    
            // Вставляем содержимое, если outputRef.current существует
            if (outputRef.current) {
              outputRef.current.innerHTML = html; // Вставляем HTML
    
              // Вставляем CSS через <link>
              const linkElement = document.createElement('link');
              linkElement.rel = 'stylesheet';
              linkElement.href = cssUrl;
              outputRef.current.appendChild(linkElement);
            }
    
            // Выполняем JS-код
            const executeJs = new Function(js);
            executeJs();
    
            return () => {
              URL.revokeObjectURL(cssUrl);
            };
          } catch (error) {
            console.error('Ошибка при выполнении кода:', error);
          }
        }, 300);
    
        return () => clearTimeout(timeoutId);
      }, [html, css, js]);
      

    useEffect(() => {
        if (!blockRef.current) {
            return;
        }

        const target = blockRef.current;

        interact(target)
            .draggable({
                listeners: {
                    move: event => {
                        ready.current= false;
                        if (!isEdit) return;
                        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx / scaleRef.current;
                        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy / scaleRef.current;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    },
                    end: () => {
                        ready.current= true;
                        if (!isEdit) return;
                        const x = parseFloat(target.getAttribute('data-x')) || 0;
                        const y = parseFloat(target.getAttribute('data-y')) || 0;
                        let newRoom = {
                            x: Math.floor(x / CHUNKSIZE),
                            y: Math.floor(y / CHUNKSIZE)
                        };
                        console.log(`curRoom ${room.x}mm${room.y}`);
                        console.log(`newRoom ${newRoom.x}mm${newRoom.y}`);
                        if (roomsAreEqual(newRoom, room)) {
                            moveBlock(id, {x, y}, width, height, newRoom);
                        } else {
                            moveBlockTo(id, {x, y}, width, height, newRoom, room);
                        }
                    }
                },
                inertia: true,
            })
            .resizable({
                edges: { right: true, bottom: true },
                restrictSize: {
                    min: { width: 100 * scaleRef.current, height: 100 * scaleRef.current },   // Minimum dimensions
                    max: { width: 700 * scaleRef.current, height: 700 * scaleRef.current }    // Maximum dimensions
                },
                listeners: {
                    move: event => {
                        if (!isEdit) return;
                        ready.current= false;
                        target.style.width = event.rect.width / scaleRef.current + 'px';
                        target.style.height = event.rect.height / scaleRef.current + 'px';
                    },
                    end: event => {
                        if (!isEdit) return;
                        moveBlock(id, {x: parseFloat(target.getAttribute('data-x')), y: parseFloat(target.getAttribute('data-y'))}, event.rect.width / scaleRef.current, event.rect.height / scaleRef.current, room);
                        ready.current= true;
                    }
                },
                inertia: true,
            });
    }, [isEdit, author, room, name, id, width, height, moveBlock, moveBlockTo, roomsAreEqual]);

    return (
        <div
          ref={blockRef}
          className={styles.block}
          style={{
            transform: `translate(${coords.x}px, ${coords.y}px)`,
            position: 'absolute',
            width: `${width}px`, // Убрать +4
            height: `${height}px`, // Убрать +4
            zIndex: 5,
            borderRadius: '5px',
            border: isEdit ? '2px solid #333' : 'none', // Добавить рамку при необходимости
          }}
          data-x={coords.x}
          data-y={coords.y}
        >
          {isEdit && (
            <button className={styles.button} onClick={() => removeBlock(id, room)}>
              x
            </button>
          )}
      <div className={styles.container} 
      styles={{  position: 'absolute',
            top: isEdit ? '-2px' : '0px',
            left: isEdit ? '-2px' : '0px',}} 
            ref={outputRef} />
        </div>
      );
      
}

export default Block;
