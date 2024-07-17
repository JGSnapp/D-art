import React, { useEffect, useRef } from 'react';
import interact from 'interactjs';
import styles from '../CSS/Block.module.css';
import HTML from './HTMLFromServer';
import EasyImage from './EasyImage';
import EasyText from './EasyText';

const Block = React.memo(function Block({
    coords, html, isEdit, id, width, height, room, author, name,
    removeBlock, moveBlock, moveBlockTo, CHUNKSIZE, ready, scaleRef, type
}) {
    const blockRef = useRef(null);

    const roomsAreEqual = (room1, room2) => {
        return room1.x === room2.x && room1.y === room2.y;
    };

    useEffect(() => {
        console.log('block');

        interact(blockRef.current)
            .draggable({
                listeners: {
                    move: event => {
                        ready.current= false;
                        if (!isEdit) return;
                        const x = (parseFloat(blockRef.current.getAttribute('data-x')) || 0) + event.dx / scaleRef.current;
                        const y = (parseFloat(blockRef.current.getAttribute('data-y')) || 0) + event.dy / scaleRef.current;
                        blockRef.current.style.transform = `translate(${x}px, ${y}px)`;
                        blockRef.current.setAttribute('data-x', x);
                        blockRef.current.setAttribute('data-y', y);
                    },
                    end: () => {
                        ready.current= true;
                        if (!isEdit) return;
                        const x = parseFloat(blockRef.current.getAttribute('data-x')) || 0;
                        const y = parseFloat(blockRef.current.getAttribute('data-y')) || 0;
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
                        blockRef.current.style.width = event.rect.width / scaleRef.current + 'px';
                        blockRef.current.style.height = event.rect.height / scaleRef.current + 'px';
                    },
                    end: event => {
                        if (!isEdit) return;
                        moveBlock(id, {x: parseFloat(blockRef.current.getAttribute('data-x')), y: parseFloat(blockRef.current.getAttribute('data-y'))}, event.rect.width / scaleRef.current, event.rect.height / scaleRef.current, room);
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
            width: `${width}px`, // ?????? +4
            height: `${height}px`, // ?????? +4
            zIndex: 5,
            borderRadius: '5px',
            border: isEdit ? '2px solid #333' : 'none', // ???????? ????? ??? ?????????????
          }}
          data-x={coords.x}
          data-y={coords.y}
        >
          {isEdit && (
            <button className={styles.button} onClick={() => removeBlock(id, room)}>
              x
            </button>
          )}
            {type == 'usual' &&
            <iframe
            srcDoc={html}
            loading="lazy"
            style={{  
            position: 'absolute',
            top: isEdit ? '-2px' : '0px',
            left: isEdit ? '-2px' : '0px',
            pointerEvents: isEdit ? 'none' : 'all',
            height: '100%',
            width: '100%',
            border: 'none',
            }}>
            </iframe>
            }     
            {type == 'easy image' &&
                <EasyImage html={html} isEdit={isEdit}/>
            } 
            {type == 'easy text' &&
                <EasyText html={html} isEdit={isEdit}/>
            }       
        </div>
      ); 
});

export default Block;
