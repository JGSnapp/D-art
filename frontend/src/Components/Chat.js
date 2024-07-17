import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import mobileStyles from '../CSS/ChatMobile.module.css'; // Стили для мобильных устройств
import desktopStyles from '../CSS/ChatDesktop.module.css'; // Стили для настольных устройств
import menuStyles from '../CSS/MenuDesktop.module.css';
import {ReactComponent as Eye} from '../images/eye_1.svg';
import {ReactComponent as Pen} from '../images/pen_1.svg'; // Замените 'your-logo.png' на путь к вашему логотипу
import MenuDesktop from './MenuDesktop.js';
import MenuMobile from './MenuMobile.js';
import GradientSVG from './GradientSVG.js';
import Zone from './Zone.js';
import Block from './Block.js';
import Admin from './Admin.js';
import HorizontalScrollDesktop from './HorizontalScrollDesktop.js';
import HorizontalScrollMobile from './HorizontalScrollMobile.js';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated } from 'react-spring';

const MAX_SCALE = 5;
const MIN_SCALE = 0.2;
const SCALE_FACTOR = 200;
const CHUNKSIZE = 3000;
const INITIAL_TRANSFORM = 'scale(0.5) translate(0px, 0px)';
const INITIAL_ORIGIN = '0px 0px';

function App({jwt, name}) {
  const [count, setCount] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [todos, setTodos] = useState({ blocks: [], zones: [], users: [], rooms: [] });
  
  const [color1, setColor1] = useState("#DB00FF");
  const [color2, setColor2] = useState("#0094FF");
  const [isMobile, setIsMobile] = useState(false);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const isMobileDevice = /Mobi/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  const currentStyles = useMemo(() => (isMobile ? mobileStyles : desktopStyles), [isMobile]);


  const widthCheck = () => {
    let type = currentStyles.open;
    if (window.innerWidth * 0.3 < 310){
      type = currentStyles.openSmall;
    }
    else if (window.innerWidth * 0.3 > 500){
      type = currentStyles.openLarge;}
    return type;
  }

  const widthCheckDeskt = () => {
    let type = menuStyles.open;
    if (window.innerWidth * 0.3 < 310){
      type = menuStyles.openSmall;
    }
    else if (window.innerWidth * 0.3 > 500){
      type = menuStyles.openLarge;}
    return type;
  }

  const [windowWidth, setWindowWidth] = useState(widthCheck());
  const [windowWidthDesctop, setWindowWidthDesctop] = useState(widthCheckDeskt());

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(widthCheck());
      setWindowWidthDesctop(widthCheckDeskt());
      console.log(widthCheck());
    };

    // Добавляем слушателя события изменения размера окна
    window.addEventListener('resize', handleResize);

    // Убираем слушателя события при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

    const coordinates = useRef({ x: 0, y: 0 });
    const [{ transform, transformOrigin }, api] = useSpring(() => ({ 
      transform: INITIAL_TRANSFORM, 
      transformOrigin: INITIAL_ORIGIN, 
      immediate: false, 
      config: { duration: 100, tension: 20, friction: 7 } }));
  
      const [fingerCount, setFingerCount] = useState(0);
  
      useEffect(() => {
        const handleTouchStart = (event) => {
          setFingerCount(event.touches.length);
        };
    
        const handleTouchMove = (event) => {
          setFingerCount(event.touches.length);
        };
  
        const handleMouseMove = (event) => {
          const { clientX, clientY } = event;
          coordinates.current ={ x: clientX, y: clientY };
        };
    
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('mousemove', handleMouseMove);
    
        return () => {
          document.removeEventListener('touchstart', handleTouchStart);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
    const trans = useRef(null);
    const ready = useRef(true);
    const scaleRef = useRef(0.5);
    const translateRef = useRef({ x: 0, y: 0 });
    const dragTranslateRef = useRef({ x: 0, y: 0 });
    const distanceRef = useRef(0);
    const offsetRef = useRef({ x: 0, y: 0 });
    const isPinch = useRef(false);
    const transformOriginRef = useRef({ x: 0, y: 0 });
    let curRoom = {x: 0, y: 0};
  
    const setNewTransform = useCallback(
      (newScale, translateX, translateY, transformOriginX, transformOriginY) => {
        api.start({
          transform: `scale(${newScale}) translate(${translateX}px, ${translateY}px)`,
          transformOrigin: `${transformOriginX}px ${transformOriginY}px`,
          immediate: false,
        });
      },
      [api]
    );
    
    const handleWheel = useCallback(
      ({ deltaY }) => {
        // Определяем направление масштабирования
        const zoomOut = deltaY > 0;
    
        // Определяем новый масштаб
        let newScale = scaleRef.current + (zoomOut ? -0.1 : 0.1);
    
        // Ограничиваем масштаб в пределах MIN_SCALE и MAX_SCALE
        newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
        const newTransformOrigin = {
          x: coordinates.current.x,
          y: coordinates.current.y,
        };
        translateRef.current = { 
          x: (transformOriginRef.current.x - newTransformOrigin.x) * (1 - scaleRef.current) / scaleRef.current + translateRef.current.x,
          y: (transformOriginRef.current.y - newTransformOrigin.y) * (1 - scaleRef.current) / scaleRef.current + translateRef.current.y
        }
        transformOriginRef.current = newTransformOrigin;
        scaleRef.current = newScale;
    
        // Добавляем инерцию
        api.start({
          transform: `scale(${newScale}) translate(${translateRef.current.x}px, ${translateRef.current.y}px)`,
          transformOrigin: `${transformOriginRef.current.x}px ${transformOriginRef.current.y}px`,
          immediate: false,
          config: { tension: 100, friction: 20 } // Экспериментируйте с параметрами
        });
      },
      [setNewTransform]
    );
    
    
    // Обработчик события масштабирования колесиком
    useEffect(() => {
      window.addEventListener('wheel', handleWheel, { passive: false });
    
      // Очистка слушателя событий для предотвращения утечек памяти
      return () => {
        window.removeEventListener('wheel', handleWheel);
      };
    }, [handleWheel]);
  
    // Gesture handling using useGesture
    const handleGesture = useGesture({
      onDragStart: ({ movement: [mx, my] }) => {
        dragTranslateRef.current = { x: mx, y: my };
      },
      onDrag: ({ movement: [mx, my] }) => {
        if (isPinch.current || !ready.current) {
          dragTranslateRef.current = { x: mx, y: my };
          return};
        translateRef.current.x = translateRef.current.x + (mx - dragTranslateRef.current.x) / scaleRef.current;
        translateRef.current.y = translateRef.current.y + (my - dragTranslateRef.current.y) / scaleRef.current;
        dragTranslateRef.current = { x: mx, y: my };
        setNewTransform(scaleRef.current, translateRef.current.x, translateRef.current.y,
          transformOriginRef.current.x, transformOriginRef.current.y);
      },
      onDragEnd: ()=> {
        let roomX = Math.floor((-translateRef.current.x + transformOriginRef.current.x *
          (1 - scaleRef.current) / scaleRef.current) / CHUNKSIZE);
       let roomY = Math.floor((-translateRef.current.y + transformOriginRef.current.y *
          (1 - scaleRef.current) / scaleRef.current )/ CHUNKSIZE);
       chunkLoader(roomX, roomY);
      },
      onPinchStart: ({ event, da: [d], origin: [x, y] }) => {
        event.preventDefault();
        isPinch.current = true;
        const rect = trans.current.getBoundingClientRect();
        const newTransformOrigin = {
          x: x - rect.left,
          y: y - rect.top,
        };
        translateRef.current = { 
          x: (transformOriginRef.current.x - newTransformOrigin.x) * (1 - scaleRef.current) / scaleRef.current + translateRef.current.x,
          y: (transformOriginRef.current.y - newTransformOrigin.y) * (1 - scaleRef.current) / scaleRef.current + translateRef.current.y
        }
        transformOriginRef.current = newTransformOrigin;
        distanceRef.current = d;
        offsetRef.current = { x, y };
        api.start({ immediate: true });
        setNewTransform(scaleRef.current, translateRef.current.x, translateRef.current.y,
          transformOriginRef.current.x, transformOriginRef.current.y);
      },
      onPinch: ({ da: [d], origin: [x, y] }) => {
        const deltaScale = d - distanceRef.current;
        let newScale  = scaleRef.current + deltaScale / SCALE_FACTOR;
        newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
        distanceRef.current = d;
  
        const movementTranslateX = (x - offsetRef.current.x) / newScale;
        const movementTranslateY = (y - offsetRef.current.y) / newScale;
  
        const translateX = translateRef.current.x + movementTranslateX;
        const translateY = translateRef.current.y + movementTranslateY;
  
        translateRef.current = { x: translateX, y: translateY };
        offsetRef.current = { x, y };
        scaleRef.current = newScale;
  
        setNewTransform(newScale, translateX, translateY,
          transformOriginRef.current.x, transformOriginRef.current.y);
      },
      onPinchEnd: () => {
        api.start({ immediate: false });
        isPinch.current = false;
        let roomX = Math.floor((-translateRef.current.x + transformOriginRef.current.x *
          (1 - scaleRef.current) / scaleRef.current) / CHUNKSIZE);
        let roomY = Math.floor((-translateRef.current.y + transformOriginRef.current.y *
           (1 - scaleRef.current) / scaleRef.current) / CHUNKSIZE);
        chunkLoader(roomX, roomY);
      }, 
  
    },
    {
      domTarget: trans,
      eventOptions: { pointer: true },
    }
  );
  
    // Binding the gesture handler
    useEffect(handleGesture, [handleGesture]);
  
  const [searchZones, setSearchZones] = useState([]);
  const [myZones, setMyZones] = useState([]);
  const [subZones, setSubZones] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [askPatText, setAskPatText] = useState([]);
  const [patText, setPatText] = useState([]);

  const [text, setText] = useState("");
  const [likes, setLikes] = useState([]);
  const [patterns, setPatterns] = useState([]);

  const [blocks, setBlocks] = useState([]);
  const [zones, setZones] = useState([]);
  const [imgShow, setImgShow] = useState(true);
  const [chunks, setChunks] = useState([
    {x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1},
    {x:-1, y:0}, {x:0, y:0}, {x:1, y:0},   
    {x:-1, y:1}, {x:0, y:1}, {x:1, y:1}
  ]);
  const [html, setHtml] = useState('');
  const [zone, setZone] = useState('');

  useEffect(() => {
    console.log("I");
    console.log(patterns);
}, [patterns]);
  useEffect(() => {
    console.log(zones);
}, [zones]);
useEffect(() => {
  console.log(likes);
}, [likes]);
useEffect(() => {
  console.log(blocks);
}, [blocks]);

const wsRef = useRef(null);
const firstRef = useRef(true);

useEffect(() => {
  if (firstRef.current == true) {
  connect();
  firstRef.current = false;
  }
}, []);

const connect = () => {
  const ws = new WebSocket(`wss://d-art.space/ws?token=${jwt}`);

  ws.onopen = () => {
    console.log('ws opened');
    ws.send(JSON.stringify({ type: "myzones"}));
    ws.send(JSON.stringify({ type: "litezones"}));
    ws.send(JSON.stringify({ type: "mylikes"}));
    ws.send(JSON.stringify({ type: "askcolors"}));
    ws.send(JSON.stringify({ type: "popularpatterns"}));
    chunks.map(chunk => {
      const msg = { type: "join", room: chunk};
      console.log(msg);
      ws.send(JSON.stringify(msg));
    })};
      
    ws.onclose = () => {
      console.log('ws closed');
      setTimeout(connect, 500);
    };

    ws.onmessage = msg => {
      console.log(JSON.parse(msg.data));
      let message = JSON.parse(msg.data);
      const { coords, width, color, height, html, id, room, type, fromroom, author, content, tags, typeblock } = message;
      if(type === "add"){
        setBlocks(prevState => prevState.filter(zone => zone.id != message.id));
        let newHtml = html.replace('__name__', name.current).replace('__id__', id);
        setBlocks(prevState => [...prevState,       
        {
          id,
          coords,
          width,
          height,
          html: newHtml,
          room,
          author,
          type: typeblock,
        }]);
      } 
      else if(type === "delete") {
        setBlocks(prevState => prevState.filter(mes => mes.id !== id));
      } 
      else if(type === "edit") {
        setBlocks(prevState => prevState.map(mes => mes.id === id ? {...mes,          
          coords,
          width,
          height,} : mes));
      }
      else if(type === "toroom") {
        setBlocks(prevBlocks => updateBlocksForToroom(prevBlocks, message));
      }
      else if(type === "fromroom") {
        setBlocks(prevState => prevState.filter(mes => !(mes.id == id && roomsAreEqual(mes.room, fromroom))));
      } 
      else if(type === "litezones"){
        setSubZones(message.zones);
      }
      else if(type === "myzones"){
        setMyZones(message.zones);
      }
      else if(type === "askcolors"){
        setColor1(message.color1);
        setColor2(message.color2);
        console.log(message);
      }
      else if(type === "searchzones"){
        setSearchZones(message.zones);
      }
      else if(type === "addzone"){
        console.log(color);
        setZones(prevState => prevState.filter(zone => zone.id != message.id));
        setZones(prevState => [...prevState,       
        {
          id,
          coords,
          height,
          width,
          content,
          room,
          author,
          color,
          tags
        }]);
      } 
      else if(type === "deletezone") {
        setZones(prevState => prevState.filter(mes => mes.id !== id));
      } 
      else if(type === "editzone") {
        console.log("qqqq");
        setZones(prevState => prevState.map(mes => mes.id == id ? {
            ...mes,         
            id, 
            coords,
            width,
            height,
            content,
            color
        } : mes));
      }
      else if(type === "zonetoroom") {
        setZones(prevZones => updateZonesForToroom(prevZones, message));
      }
      else if(type === "zonefromroom") {
        setZones(prevState => prevState.filter(mes => !(mes.id == id && roomsAreEqual(mes.room, fromroom))));
      } 
      else if(type === "tpto") {
        console.log("111");
        console.log(message.zones[0]);
        tpto(message.zones[0]);
      } 
      else if (type === "mylikes") {
        const newLikes = message.likes || []; // If message.likes is null, use an empty array
        setLikes(newLikes);
      }
      else if(type === "givepatterns") {
        setPatterns(message.patterns);
        console.log("a");
      }
      else if(type === "admin_get_connections") {
        setCount(message.connections);
        console.log(message);
      }
      else if(type === "admin_get_blocks") {
        setTodos(prevState => {let a = prevState;
        a["blocks"] = message.blocks
        return a;
      });
        console.log(message);
      }
      else if(type === "admin_get_users") {
        setTodos(prevState => {let a = prevState;
        a["users"] = message.blocks
        return a;
      });
        console.log(message);
      }
      else if(type === "admin_get_rooms") {
        setTodos(prevState => {let a = prevState;
        a["rooms"] = message.blocks
        return a;
      });
        console.log(message);
      }
      else if(type === "admin_get_zones") {
        setTodos(prevState => {let a = prevState;
        a["zones"] = message.blocks
        return a;
      });
        console.log(message);
      }
      else if(type === "edituser") {
        name.current = message.Username;
        localStorage.setItem('username', message.Username);
        console.log(message);
      }
  }
  ws.onerror = (err) => {
    console.error(err); // log error
  };
  wsRef.current = ws;
  };

  const updateBlocksForToroom = (blocks, message) => {
    const blockExists = blocks.some(block => block.id === message.id);
    
    if (blockExists) {
      return blocks.map(block => block.id === message.id ? { ...block, coords: message.coords, width: message.width, height: message.height, room: message.room } : block);
    } else {
      return [...blocks, {
        id: message.id,
        coords: message.coords,
        width: message.width,
        height: message.height,
        html: message.html,
        room: message.room,
        author: message.author
      }];
    }
  };
  const roomsAreEqual = (room1, room2) => {
    return room1.x === room2.x && room1.y === room2.y;
  }

  const updateZonesForToroom = (zones, message) => {
    const blockExists = zones.some(zone => zone.id === message.id);
    console.log(blockExists);
    
    if (blockExists) {
      return zones.map(zone => zone.id == message.id ? { ...zone, coords: message.coords, content: message.content, width: message.width, height: message.height, room: message.room } : zone);
    } else {
      return [...zones, {
        id: message.id,
        coords: message.coords,
        width: message.width,
        height: message.height,
        content: message.content,
        room: message.room,
        author: message.author
      }];
    }
  };

  const removeBlock = (id, room) => {
    const msg = { type: "delete", room, id};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }; 

  const moveBlock = (id, coords, width, height, room ) => {
    setBlocks(prevState => prevState.map(mes => mes.id == id ? {
      ...mes,         
      id,
      room,
      coords,
      width,
      height
  } : mes));
    const msg = { 
      type: "edit", 
      id,
      room,
      coords,
      width,
      height
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }
  
  const moveBlockTo = (id, coords, width, height, room, fromroom) => {
    setBlocks(prevState => prevState.map(mes => mes.id == id ? {
      ...mes,         
      id,
      room,
      coords,
      width,
      height
  } : mes));
    const msg = { 
      type: "toroom", 
      id,
      room,
      fromroom,
      coords,
      width,
      height
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }

  const addBlockTask = (html, type) => {
    let height = 0.15 * CHUNKSIZE;
    let width = 0.15 * CHUNKSIZE;
    let x = -translateRef.current.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    let y = -translateRef.current.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    let roomX = Math.floor(x / CHUNKSIZE);
    let roomY = Math.floor(y / CHUNKSIZE);
    console.log(html);
    const msg = { 
      type: "add", 
      room: {x: roomX, y: roomY},
      coords: {x, y},
      width: width,
      height: height,
      html: html.replace('__author__', name.current),
      typeblock: type
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setHtml("");
    setPatText("");
  }

  const addBlock = () => {
    let height = 0.15 * CHUNKSIZE;
    let width = 0.15 * CHUNKSIZE;
    let x = -translateRef.current.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    let y = -translateRef.current.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    let roomX = Math.floor(x / CHUNKSIZE);
    let roomY = Math.floor(y / CHUNKSIZE);
    console.log(html);
    const msg = { 
      type: "add", 
      room: {x: roomX, y: roomY},
      coords: {x, y},
      width: width,
      height: height,
      html: html.replace('__author__', name.current),
      typeblock: 'usual'
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setHtml("");
    setPatText("");
  }

  const removeZone = (id, room) => {
    const msg = { type: "deletezone", room, id};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setMyZones(prevState => prevState.filter(message => (message.id !== id)));
  }; 

  const updateColor = (id, color, room) => {
    const msg = { type: "updatecolor", color, id, room};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }

  const moveZone = (id, coords, content, width, height, room ) => {
    setZones(prevState => prevState.map(mes => mes.id == id ? {
      ...mes,         
      id, 
      coords,
      width,
      height,
      content
  } : mes));
    const msg = { 
      type: "editzone", 
      id,
      room,
      content,
      coords,
      width,
      height
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    
  }

  const moveZoneTo = (id, coords, content, width, height, room, fromroom) => {
    setZones(prevState => prevState.map(mes => mes.id == id ? {
      ...mes,         
      id, 
      coords,
      width,
      height,
      content,
      room
  } : mes));

    const msg = { 
      type: "zonetoroom", 
      id,
      room,
      content,
      fromroom,
      coords,
      width,
      height
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }

  const addZone = () => {
    let height = 0.3 * CHUNKSIZE;
    let width = 0.3 * CHUNKSIZE;
    let x = -translateRef.current.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    let y = -translateRef.current.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    let roomX = Math.floor(x / CHUNKSIZE);
    let roomY = Math.floor(y / CHUNKSIZE);
    const msg = { 
      type: "addzone", 
      room: {x: roomX, y: roomY},
      coords: {x, y},
      width: width,
      height: height,
      content: zone,    
      color: "#cd9ac3",
      tags: tags,
    };
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setZone("");
  }

  const addPattern = () => {
    const msg = { 
      type: "addpattern", 
      html,
      content: patText,
      typeblock: "usual"
    };
    wsRef.current.send(JSON.stringify(msg));
    const msg1 = { 
      type: "other", 
      content: patText
    };
    wsRef.current.send(JSON.stringify(msg1));
    setHtml("");
    setPatText("");
  }

  const deletePattern = (id) => {
    const msg = { 
      type: "deletepattern", 
      id
    };
    wsRef.current.send(JSON.stringify(msg));
    setPatterns(prevState => prevState.filter(message => (message.id !== id)));
    console.log(msg);
  }

  const givePatterns = (content) => {
    const msg = { type: "givepatterns", content};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }

  const popularPatterns = () => {
    const msg = { type: "popularpatterns"};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }

  const likePattern = (id) => {
    const msg = { 
      type: "likepattern", 
      id
    };
    wsRef.current.send(JSON.stringify(msg));
    setLikes([...likes, id]);
    console.log(msg);
  }

  const unlikePattern = (id) => {
    const msg = { 
      type: "unlikepattern", 
      id
    };
    wsRef.current.send(JSON.stringify(msg));
    setLikes(prevState => prevState.filter(message => (message !== id)));
    console.log(msg);
  }
  
  const addRoom = room => {
    const msg = { type: "join", room};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  };

  const leaveRoom = room => {
    const msg = { type: "leave", room};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setBlocks(prevState => prevState.filter(message => !roomsAreEqual(message.room, room)));
    setZones(prevState => prevState.filter(message => !roomsAreEqual(message.room, room)));
  };

  const askForZones = (content) => {
    const msg = { type: "askforzones", content};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setText(content);
  }

  const leave = (id) => {
    const msg = { type: "leavezone", id};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setSubZones(prevState => prevState.filter(message => (message.id !== id)));
  }

  const tp = (id) => {
    wsRef.current.send(JSON.stringify({ type: "tpto", id}));
    console.log("a");
  }

  const tpto = (liteZone) => {
    let id = liteZone.id;
    let coords = liteZone.coords;
    coords.x = -coords.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    coords.y = -coords.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    setMyZones(prevState => prevState.map(mes => mes.id === id ? {...mes,          
      coords} : mes));
    setSubZones(prevState => prevState.map(mes => mes.id === id ? {...mes,          
      coords} : mes));
    translateRef.current = { x: coords.x, y: coords.y };
    const roomX = Math.floor(-translateRef.current.x / CHUNKSIZE);
    const roomY = Math.floor(-translateRef.current.y / CHUNKSIZE);
    chunkLoader(roomX, roomY);
    setIsSearchOpen(false);
    setNewTransform(scaleRef.current, translateRef.current.x, translateRef.current.y,
      transformOriginRef.current.x, transformOriginRef.current.y);
  }

  const subZone = (id, coords, content) => {
    const msg = { type: "subzone", id};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setSubZones([...subZones, {id, coords, content}]);
  }

  const updateColors = (id, color1, color2) => {
    const msg = { type: "updatecolors", color1, color2, id};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    setColor1(color1);
    setColor2(color2);
  }; 

  const getBlocks = (id, zone, author, html, roomxmin, roomxmax, roomymin, roomymax) => {
    const msg = { 
      type: "admin_get_blocks", 
      id,
      zone,
      author,
      content: html,
      roomxmax,
      roomxmin,
      roomymax,
      roomymin,
      limit: 50,
      skip: 0};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }; 

  const getZones = (id, author, content, roomxmin, roomxmax, roomymin, roomymax) => {
    const msg = { 
      type: "admin_get_zones", 
      id,
      author,
      content,
      roomxmax,
      roomxmin,
      roomymax,
      roomymin,
      limit: 50,
      skip: 0};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  };

  const getUsers = (id, username, likes) => {
    const msg = { 
      type: "admin_get_users", 
      id,
      content: username,
      zone: likes,
      limit: 50,
      skip: 0};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }; 

  const deleteUser = ( username ) => {
    const msg = { 
      type: "deleteuser",
      content: username};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }; 

  const deleteMyself = () => {
    const msg = { 
      type: "deleteuser",
      content: name};
    console.log(msg);
    localStorage.removeItem('password');
    localStorage.removeItem('username');
    window.location.reload(true);
    wsRef.current.send(JSON.stringify(msg));
  }; 


  const getRooms = (roomxmin, roomxmax, roomymin, roomymax) => {
    const msg = { 
      type: "admin_get_rooms", 
      roomxmax,
      roomxmin,
      roomymax,
      roomymin,
      limit: 50,
      skip: 0};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  }; 

  const getConnections = () => {
    const msg = { type: "admin_get_connections"};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
  };

  
  const editUser = (password, username) => {
    const msg = { type: "edituser", content: password, id: username};
    console.log(msg);
    wsRef.current.send(JSON.stringify(msg));
    name.current = username;
    localStorage.setItem('username', username);
    localStorage.setItem('password', password);
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMobile) {
      setIsSearchOpen(false);
    }
  };

  const startEdit = () => {
    setIsEdit(!isEdit);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  
  const toggleSearch = () => {
    setIsSearchOpen(true);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const downSearch = () => {
    setIsSearchOpen(false);
    console.log('aaaaaaaaa');
  };

  const chunkLoader =(roomX, roomY) => {
    let room = {x: roomX, y: roomY}
    console.log(room);
    console.log(curRoom);
    if (!roomsAreEqual(room,  curRoom)){
      console.log("sss");
      let newChunks = [];

      for (let xOffset = Math.min(Math.floor(-1.2 / scaleRef.current), -1); xOffset <= Math.max(Math.floor(1.2 / scaleRef.current), 1); xOffset++) {
        for (let yOffset = Math.min(Math.floor(-1.2 / scaleRef.current), -1); yOffset <= Math.max(Math.floor(1.2 / scaleRef.current), 1); yOffset++) {
          newChunks.push({
            x: roomX + xOffset,
            y: roomY + yOffset,
            nec: true
          });
        }
      }
      
      chunks.forEach(chunk => {
        const index = newChunks.findIndex(newChunk => (roomsAreEqual(newChunk, chunk)));
        let excess = true;
        if (index !== -1) {
            newChunks[index].nec = false;
            excess = false;
        }
        if (excess) {
            leaveRoom(chunk);
            setBlocks(prevState => prevState.filter(message => !roomsAreEqual(chunk, message.room)));
            setZones(prevState => prevState.filter(message => !roomsAreEqual(chunk, message.room)));
        }
      });

      curRoom = room;
      const updatedChunks = newChunks.map(chunk => ({x: chunk.x, y: chunk.y}));
      setChunks(updatedChunks);
      newChunks.forEach(newChunk => {
        if(newChunk.nec){
          addRoom({x: newChunk.x, y: newChunk.y});
        }
      });
    }
  }

  const updateFile = async (taskId, file, type) => {
    console.log(`${type} ${taskId}`);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://d-art.space/backend/upload_${type}`, {
        method: 'POST',
        headers: {
          'id': type == 'back'? name.current : taskId
        },
        body: formData
      });

      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Failed to upload file');
      }
      if(type == 'back') {
        setImgShow(true);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className={`App ${currentStyles.App}`} ref={trans}>

{admin ? <Admin
        removeUser={deleteUser}
        removeZone={removeZone}
        removeBlock={removeBlock}
        setAdmin={setAdmin}
        addBlock={addBlock}
        addZone={addZone}
        editUser={editUser}
        getBlocks={getBlocks}
        getZones={getZones}
        getUsers={getUsers}
        getRooms={getRooms}
        getConnections={getConnections}
        todos={todos}
        count={count}
         style={{      
          zIndex: 1000,          
          position: 'absolute',
          top: 0,
          left: 0,
          width: `100%`,
          height: `100%`,
          pointerEvents: 'none',}}>
          </Admin> :

        <div>

      { imgShow && <img src={`https://d-art.space/backend/backs/${name.current}`} 
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
                objectFit: 'cover',
                pointerEvents: 'none',}}/>}

    <animated.div
      style={{
        position: 'absolute',
        transform,
        width: '0px',
        height: '0px',
        backgroundColor: 'lightgrey',
        pointerEvents: 'all',
        transformOrigin,
        cursor: 'grab',
      }}
    >
        {zones.map(zone => 
          <Zone 
          editUser={editUser}
          ready={ready}
          scaleRef={scaleRef}
          name = {name.current}
            author = {zone.author}
            key={zone.id} 
            room={zone.room}
            id={zone.id} 
            coords={zone.coords} 
            width={zone.width}
            height={zone.height}
            content={zone.content}
            isEdit={isMobile? isEdit : isMenuOpen}
            CHUNKSIZE={CHUNKSIZE}
            removeZone={removeZone}
            moveZone={moveZone}
            moveZoneTo={moveZoneTo}
            subZone={subZone}
            leaveZone={leave}
            subZones = {subZones}
            startcolor={zone.color}
            updateColor={updateColor}
            updateFile={updateFile}
            updateColors={updateColors}
            color1={color1}
            color2={color2}
            setAdmin={setAdmin}
            deleteMyself={deleteMyself}
            tags={zone.tags}
          />)}
          {blocks.map(block => 
          <Block 
          ready={ready}
          scaleRef={scaleRef}
          type={block.type}
            author = {block.author}
            key={block.id} 
            room={block.room}
            id={block.id} 
            coords={block.coords}
            width={block.width}
            height={block.height}
            html={block.html}
            name = {name.current}
            isEdit={isMobile? isEdit : isMenuOpen}
            CHUNKSIZE={CHUNKSIZE}
            removeBlock={removeBlock}
            moveBlock={moveBlock}
            moveBlockTo={moveBlockTo}
          />)}

    </animated.div>

      {isSearchOpen && <button className={currentStyles.back} onClick={downSearch} tabIndex={0} />}
      <div className={`${currentStyles.search} ${isSearchOpen ? currentStyles.open : ''}`}>
        <div className={`${currentStyles.con} ${isMenuOpen && !isMobile ? windowWidth : ''}`}>
          {isMobile? 
          <UpMenuMobile
            searchZones={searchZones}
            subZones={subZones}
            myZones={myZones}
            leave = {leave}
            tp = {tp}
            color1={color1}
            color2={color2}
          /> : <UpMenuDesktop
            searchZones={searchZones}
            subZones={subZones}
            myZones={myZones}
            leave = {leave}
            tp = {tp}
            color1={color1}
            color2={color2}
          />}
        </div>
      </div>
      <div className={`${currentStyles.topBar} ${isMobile && isMenuOpen ? currentStyles.open : ''} ${!isMobile && isMenuOpen ? windowWidth : ''}`}>
        <GradientSVG className={`${currentStyles.logo}`} 
            color1={color1}
            color2={color2}></GradientSVG>
        <input
          type="text"
          placeholder="Поиск области по названию"
          className={`${currentStyles.input}`}
          value={text} 
          onChange={event =>{askForZones(event.target.value)}}
          onClick={toggleSearch}
        />
      </div>

      {isMobile? 
          <MenuMobile
          isMenuOpen={isMenuOpen}
          html={html} setHtml={setHtml}
          patterns={patterns}
          likes={likes} SetLikes={setLikes}
          patText={patText} setPatText={setPatText}
          askPatText={askPatText} setAskPatText={setAskPatText}
          addPattern={addPattern}
          deletePattern={deletePattern}
          givePatterns={givePatterns}
          popularPatterns={popularPatterns}
          likePattern={likePattern}
          unlikePattern={unlikePattern}
          name={name.current}
          toggleMenu={toggleMenu}
          addZone={addZone}
          setZone={setZone}
          zone={zone}
          addBlock={addBlock}
          addBlockTask={addBlockTask}
          color1={color1}
          color2={color2}
          tags={tags}
          setTags={setTags}
          /> : <MenuDesktop
          isMenuOpen={isMenuOpen}
          html={html} setHtml={setHtml}
          patterns={patterns}
          likes={likes} SetLikes={setLikes}
          patText={patText} setPatText={setPatText}
          askPatText={askPatText} setAskPatText={setAskPatText}
          addPattern={addPattern}
          deletePattern={deletePattern}
          givePatterns={givePatterns}
          popularPatterns={popularPatterns}
          likePattern={likePattern}
          unlikePattern={unlikePattern}
          name={name.current}
          toggleMenu={toggleMenu}
          addZone={addZone}
          setZone={setZone}
          zone={zone}
          addBlock={addBlock}
          addBlockTask={addBlockTask}
          windowWidth={windowWidthDesctop}
          color1={color1}
          color2={color2}
          tags={tags}
          setTags={setTags}
          />}
<button
  className={`${currentStyles.toggle_button} ${isMobile && isMenuOpen ? currentStyles.open : ''} ${!isMobile && isMenuOpen ? windowWidth : ''}`}
  style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}
  onClick={isMobile ? startEdit : toggleMenu}
  tabIndex={0}
>
  <div className={currentStyles.button_content}>
    {(isMobile && isEdit) || (!isMobile && isMenuOpen) ? <Eye src={Eye} alt="Logo" className={`${currentStyles.button_svg}`} /> : <Pen src={Pen} alt="Logo" className={`${currentStyles.button_svg}`} />}
  </div>
</button>


      {isEdit &&
      <button
        className={`${currentStyles.edit_button} ${isMenuOpen ? currentStyles.open : ''}`}
        style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}
        onClick={toggleMenu}
        tabIndex={0}
      >
        {isMenuOpen ? 'Закрыть' : 'Добавить'}
      </button>}
      </div>
  }
    </div>
  );
}

const UpMenuMobile = ({searchZones, subZones, myZones, leave, tp, color1, color2}) => {
  return(
    <div className={`App ${mobileStyles.upMenu}`}>
      <hr className={mobileStyles.separator} 
      style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}/>
          <h2 className={mobileStyles.text2x}
          style={{color: `${color1}`}}>Результаты поиска</h2>
          {searchZones.length === 0 ? 
            <p className={mobileStyles.textx}
            style={{color: `${color1}`}} >Ничего не найдено</p> :
            <HorizontalScrollMobile
            zones ={searchZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
          <hr className={mobileStyles.separator} 
          style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}/>
            <h2 className={mobileStyles.text2x}
            style={{color: `${color1}`}}>Ваши подписки</h2>
                       
            {subZones.length === 0 ? 
            <p className={mobileStyles.textx}
            style={{color: `${color1}`}}>Вы пока ни на что не подписан</p> :
            <HorizontalScrollMobile
            zones ={subZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
          <hr className={desktopStyles.separator} 
          style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}/>
            <h2 className={mobileStyles.text2x}
            style={{color: `${color1}`}}>Ваши области</h2>

            {myZones.length === 0 ? 
            <p className={mobileStyles.textx}
            style={{color: `${color1}`}}>Вы пока не создавали свои области</p> :
            <HorizontalScrollMobile
            zones ={myZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
    </div>
  );
}

const UpMenuDesktop = ({searchZones, subZones, myZones, leave, tp, color1, color2}) => {
  return(
    <div className={`App ${desktopStyles.upMenu}`}>
      <hr className={desktopStyles.separator} 
      style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}}/>
      <h2 className={desktopStyles.text2x}
      style={{color: `${color1}`}}>Результаты поиска</h2>

          {searchZones.length === 0 ? 
            <p className={desktopStyles.textx}
            style={{color: `${color1}`}} >Ничего не найдено</p> :
            <HorizontalScrollDesktop 
            zones ={searchZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}

          <hr className={desktopStyles.separator}
          style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}} />
            <h2 className={desktopStyles.text2x}
            style={{color: `${color1}`}}>Ваши подписки</h2>
                       
            {subZones.length === 0 ? 
            <p className={desktopStyles.textx}
            style={{color: `${color1}`}}>Вы пока ни на что не подписан</p> :
            <HorizontalScrollDesktop 
            zones ={subZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}

            <hr className={desktopStyles.separator}
            style={{backgroundImage: `linear-gradient(45deg, ${color1}, ${color2})`,}} />
            <h2 className={desktopStyles.text2x}
            style={{color: `${color1}`}}>Ваши области</h2>

            {myZones.length === 0 ? 
            <p className={desktopStyles.textx}
            style={{color: `${color1}`}}>Вы пока не создавали свои области</p> :
            <HorizontalScrollDesktop 
            zones ={myZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
    </div>
  );
}

export default App;
