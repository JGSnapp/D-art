import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import mobileStyles from '../CSS/ChatMobile.module.css'; // Стили для мобильных устройств
import desktopStyles from '../CSS/ChatDesktop.module.css'; // Стили для настольных устройств
import logo from '../images/mini.png'; // Замените 'your-logo.png' на путь к вашему логотипу
import MenuDesktop from './MenuDesktop.js';
import MenuMobile from './MenuMobile.js';
import Zone from './Zone.js';
import Block from './Block.js';
import HorizontalScrollDesktop from './HorizontalScrollDesktop.js';
import HorizontalScrollMobile from './HorizontalScrollMobile.js';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated } from 'react-spring';
import DOMPurify from 'dompurify';

const MAX_SCALE = 5;
const MIN_SCALE = 0.2;
const SCALE_FACTOR = 200;
const CHUNKSIZE = 3000;
const INITIAL_TRANSFORM = 'scale(0.5) translate(0px, 0px)';
const INITIAL_ORIGIN = '0px 0px';

function App({jwt, name}) {

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
      domTarget: window,
      eventOptions: { passive: false },
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
  const [isMobile, setIsMobile] = useState(false);

  const [askPatText, setAskPatText] = useState([]);
  const [patText, setPatText] = useState([]);

  const [text, setText] = useState("");
  const [likes, setLikes] = useState([]);
  const [patterns, setPatterns] = useState([]);

  const [blocks, setBlocks] = useState([]);
  const [zones, setZones] = useState([]);
  const [chunks, setChunks] = useState([
    {x:-1, y:-1}, {x:0, y:-1}, {x:1, y:-1},
    {x:-1, y:0}, {x:0, y:0}, {x:1, y:0},   
    {x:-1, y:1}, {x:0, y:1}, {x:1, y:1}
  ]);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
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

const ws = useRef(null);

useEffect(() => {
  connectWebSocket();
  console.log("asdsdsdsdsdsdsdsdsdsdsd");

  // Cleanup function to close the WebSocket connection when the component unmounts
  return () => {
    if (ws.current) {
      ws.current.close();
    }
  };
}, []);

const connectWebSocket = () => {
  if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
    console.log("Issss");
    ws.current = new WebSocket(`ws://192.168.0.117:8080/ws?token=${jwt}`);

    ws.current.onopen = () => {
      console.log('ws opened');
      ws.current.send(JSON.stringify({ type: "myzones"}));
      ws.current.send(JSON.stringify({ type: "litezones"}));
      ws.current.send(JSON.stringify({ type: "mylikes"}));
      ws.current.send(JSON.stringify({ type: "popularpatterns"}));
      chunks.map(chunk => addRoom(chunk))};
      
    ws.current.onclose = () => {
      console.log('ws closed');
      setTimeout(connectWebSocket, 2000);
    };

    ws.current.onmessage = msg => {
      console.log(JSON.parse(msg.data));
      let message = JSON.parse(msg.data);
      const { coords, width, color, height, html, css, js, id, room, type, fromroom, author, content } = message;
      if(type === "add"){
        setBlocks(prevState => prevState.filter(zone => zone.id != message.id));
        let newJs = js.replace('%%name%%', name).replace('%%id%%', id);
        console.log(newJs);
        setBlocks(prevState => [...prevState,       
        {
          id,
          coords,
          width,
          height,
          html,
          css,
          js: newJs,
          room,
          author
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
          color
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
    };
  }
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
        css: message.css,
        js: message.js,
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
    ws.current.send(JSON.stringify(msg));
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
    ws.current.send(JSON.stringify(msg));
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
    ws.current.send(JSON.stringify(msg));
  }

  const addBlock = () => {
    const sanitizedHTML = DOMPurify.sanitize(html);
    const sanitizedCSS = DOMPurify.sanitize(css);
    const sanitizedJS = DOMPurify.sanitize(js);
    let height = 0.15 * CHUNKSIZE;
    let width = 0.15 * CHUNKSIZE;
    let x = -translateRef.current.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    let y = -translateRef.current.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    let roomX = Math.floor(x / CHUNKSIZE);
    let roomY = Math.floor(y / CHUNKSIZE);
    console.log(html);
    console.log(css);
    console.log(js);
    const msg = { 
      type: "add", 
      room: {x: roomX, y: roomY},
      coords: {x, y},
      width: width,
      height: height,
      html: sanitizedHTML,
      css: sanitizedCSS,
      js: sanitizedJS.replace('%%author%%', name),
    };
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setHtml("");
    setCss("");
    setJs("");
    setPatText("");
  }

  const addBlockTask = (html, js, css) => {
    const sanitizedHTML = DOMPurify.sanitize(html);
    const sanitizedCSS = DOMPurify.sanitize(css);
    const sanitizedJS = DOMPurify.sanitize(js);
    let height = 0.15 * CHUNKSIZE;
    let width = 0.15 * CHUNKSIZE;
    let x = -translateRef.current.x - transformOriginRef.current.x * (1 - scaleRef.current) / scaleRef.current;
    let y = -translateRef.current.y - transformOriginRef.current.y * (1 - scaleRef.current) / scaleRef.current;
    let roomX = Math.floor(x / CHUNKSIZE);
    let roomY = Math.floor(y / CHUNKSIZE);
    console.log(html);
    console.log(css);
    console.log(js);
    const msg = { 
      type: "add", 
      room: {x: roomX, y: roomY},
      coords: {x, y},
      width: width,
      height: height,
      html: sanitizedHTML,
      css: sanitizedCSS,
      js: sanitizedJS.replace('%%author%%', name),
    };
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setHtml("");
    setCss("");
    setJs("");
    setPatText("");
  }
  const removeZone = (id, room) => {
    const msg = { type: "deletezone", room, id};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setMyZones(prevState => prevState.filter(message => (message.id !== id)));
  }; 

  const updateColor = (id, color, room) => {
    const msg = { type: "updatecolor", color, id, room};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
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
    ws.current.send(JSON.stringify(msg));
    
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
    ws.current.send(JSON.stringify(msg));
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
    };
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setZone("");
  }

  const addPattern = () => {
    const msg = { 
      type: "addpattern", 
      html,
      css,
      js,
      content: patText
    };
    ws.current.send(JSON.stringify(msg));
    const msg1 = { 
      type: "other", 
      content: patText
    };
    ws.current.send(JSON.stringify(msg1));
    setHtml("");
    setCss("");
    setJs("");
    setPatText("");
  }

  const deletePattern = (id) => {
    const msg = { 
      type: "deletepattern", 
      id
    };
    ws.current.send(JSON.stringify(msg));
    setPatterns(prevState => prevState.filter(message => (message.id !== id)));
    console.log(msg);
  }

  const givePatterns = (content) => {
    const msg = { type: "givepatterns", content};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
  }

  const popularPatterns = () => {
    const msg = { type: "popularpatterns"};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
  }

  const likePattern = (id) => {
    const msg = { 
      type: "likepattern", 
      id
    };
    ws.current.send(JSON.stringify(msg));
    setLikes([...likes, id]);
    console.log(msg);
  }

  const unlikePattern = (id) => {
    const msg = { 
      type: "unlikepattern", 
      id
    };
    ws.current.send(JSON.stringify(msg));
    setLikes(prevState => prevState.filter(message => (message !== id)));
    console.log(msg);
  }
  
  const addRoom = room => {
    const msg = { type: "join", room};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
  };

  const leaveRoom = room => {
    const msg = { type: "leave", room};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setBlocks(prevState => prevState.filter(message => !roomsAreEqual(message.room, room)));
    setZones(prevState => prevState.filter(message => !roomsAreEqual(message.room, room)));
  };

  const askForZones = (content) => {
    const msg = { type: "askforzones", content};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setText(content);
  }

  const leave = (id) => {
    const msg = { type: "leavezone", id};
    console.log(msg);
    ws.current.send(JSON.stringify(msg));
    setSubZones(prevState => prevState.filter(message => (message.id !== id)));
  }

  const tp = (id) => {
    ws.current.send(JSON.stringify({ type: "tpto", id}));
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
    ws.current.send(JSON.stringify(msg));
    setSubZones([...subZones, {id, coords, content}]);
  }

  const currentStyles = useMemo(() => (isMobile ? mobileStyles : desktopStyles), [isMobile]);

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

  useEffect(() => {
    const isMobileDevice = /Mobi/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);

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
      const response = await fetch(`http://192.168.0.117:8080/upload_${type}`, {
        method: 'POST',
        headers: {
          'id': taskId
        },
        body: formData
      });

      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className={`App ${currentStyles.App}`}       ref={trans}>

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
          ready={ready}
          scaleRef={scaleRef}
          name = {name}
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
          />)}
          {blocks.map(block => 
          <Block 
          ready={ready}
          scaleRef={scaleRef}
            author = {block.author}
            key={block.id} 
            room={block.room}
            id={block.id} 
            coords={block.coords}
            width={block.width}
            height={block.height}
            html={block.html}
            css={block.css}
            js={block.js}
            name = {name}
            isEdit={isMobile? isEdit : isMenuOpen}
            CHUNKSIZE={CHUNKSIZE}
            removeBlock={removeBlock}
            moveBlock={moveBlock}
            moveBlockTo={moveBlockTo}
          />)}

    </animated.div>

      {isSearchOpen && <button className={currentStyles.back} onClick={downSearch} tabIndex={0} />}
      <div className={`${currentStyles.search} ${isSearchOpen ? currentStyles.open : ''}`}>
        <div className={`${currentStyles.con} ${isMenuOpen && !isMobile ? currentStyles.open : ''}`}>
          {isMobile? 
          <UpMenuMobile
            searchZones={searchZones}
            subZones={subZones}
            myZones={myZones}
            leave = {leave}
            tp = {tp}
          /> : <UpMenuDesktop
            searchZones={searchZones}
            subZones={subZones}
            myZones={myZones}
            leave = {leave}
            tp = {tp}
          />}
        </div>
      </div>
      <div className={`${currentStyles.topBar} ${isMenuOpen ? currentStyles.open : ''}`}>
        <img src={logo} alt="Logo" className={`${currentStyles.logo}`} loading="lazy" />
        <input
          type="text"
          placeholder="Введите название области"
          className={`${currentStyles.input}`}
          value={text} 
          onChange={event =>{askForZones(event.target.value)}}
          onClick={toggleSearch}
        />
      </div>

      {isMobile? 
          <MenuMobile
          isMenuOpen={isMenuOpen}
          addBlock={addBlock} 
          html={html} setHtml={setHtml}
          css={css} setCss={setCss}
          js={js} setJs={setJs} 
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
          name={name}
          toggleMenu={toggleMenu}
          addZone={addZone}
          setZone={setZone}
          zone={zone}
          addBlockTask={addBlockTask}
          /> : <MenuDesktop
          isMenuOpen={isMenuOpen}
          addBlock={addBlock} 
          html={html} setHtml={setHtml}
          css={css} setCss={setCss}
          js={js} setJs={setJs} 
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
          name={name}
          toggleMenu={toggleMenu}
          addZone={addZone}
          setZone={setZone}
          zone={zone}
          addBlockTask={addBlockTask}
          />}
      <button
        className={`${currentStyles.toggle_button} ${isMenuOpen ? currentStyles.open : ''}`}
        onClick={isMobile ? startEdit : toggleMenu}
        tabIndex={0}
      >
        {isEdit ? 'Назад' : 'Изменить'}
      </button>
      {isEdit &&
      <button
        className={`${currentStyles.edit_button} ${isMenuOpen ? currentStyles.open : ''}`}
        onClick={toggleMenu}
        tabIndex={0}
      >
        {isMenuOpen ? 'Закрыть' : 'Добавить'}
      </button>}
    </div>
  );
}

const UpMenuMobile = ({searchZones, subZones, myZones, leave, tp}) => {
  return(
    <div className={`App ${mobileStyles.upMenu}`}>
      <hr className={mobileStyles.separator} />
          <h2 className={mobileStyles.text2x}>Результаты поиска</h2>
          {searchZones.length === 0 ? 
            <p className={mobileStyles.textx} >Ничего не найдено</p> :
            <HorizontalScrollMobile
            zones ={searchZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
          <hr className={mobileStyles.separator} />
            <h2 className={mobileStyles.text2x}>Ваши подписки</h2>
                       
            {subZones.length === 0 ? 
            <p className={mobileStyles.textx}>Вы пока ни на что не подписан</p> :
            <HorizontalScrollMobile
            zones ={subZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
          <hr className={desktopStyles.separator} />
            <h2 className={mobileStyles.text2x}>Ваши области</h2>

            {myZones.length === 0 ? 
            <p className={mobileStyles.textx}>Вы пока не создавали свои области</p> :
            <HorizontalScrollMobile
            zones ={myZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
    </div>
  );
}

const UpMenuDesktop = ({searchZones, subZones, myZones, leave, tp}) => {
  return(
    <div className={`App ${desktopStyles.upMenu}`}>
      <hr className={desktopStyles.separator} />
      <h2 className={desktopStyles.text2x}>Результаты поиска</h2>

          {searchZones.length === 0 ? 
            <p className={desktopStyles.textx} >Ничего не найдено</p> :
            <HorizontalScrollDesktop 
            zones ={searchZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}

          <hr className={desktopStyles.separator} />
            <h2 className={desktopStyles.text2x}>Ваши подписки</h2>
                       
            {subZones.length === 0 ? 
            <p className={desktopStyles.textx}>Вы пока ни на что не подписан</p> :
            <HorizontalScrollDesktop 
            zones ={subZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}

            <hr className={desktopStyles.separator} />
            <h2 className={desktopStyles.text2x}>Ваши области</h2>

            {myZones.length === 0 ? 
            <p className={desktopStyles.textx}>Вы пока не создавали свои области</p> :
            <HorizontalScrollDesktop 
            zones ={myZones}
            subZones={subZones}
            tp={tp}
            leave={leave}/>}
    </div>
  );
}

export default App;
