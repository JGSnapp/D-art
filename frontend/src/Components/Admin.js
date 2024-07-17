import React, { useState, useEffect } from 'react';

// Компонент для формы списка blocks
const BlocksForm = ({ getBlocks }) => {
  const [id, setId] = useState('');
  const [zone, setZone] = useState('');
  const [author, setAuthor] = useState('');
  const [html, setHtml] = useState('');
  const [minX, setMinX] = useState('');
  const [maxX, setMaxX] = useState('');
  const [minY, setMinY] = useState('');
  const [maxY, setMaxY] = useState('');

  const handleSearchBlocks = () => {
    // Ваша логика для добавления блока
    getBlocks( id, zone, author, html, minX, maxX, minY, maxY );

  };

  return (
    <div>
      {/* Ваши поля ввода для списка blocks */}
      <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="text" placeholder="Zone" value={zone} onChange={(e) => setZone(e.target.value)} />
      <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <input type="text" placeholder="HTML" value={html} onChange={(e) => setHtml(e.target.value)} />
      <input type="number" placeholder="minX" value={minX} onChange={(e) => setMinX(e.target.value)} />
      <input type="number" placeholder="maxX" value={maxX} onChange={(e) => setMaxX(e.target.value)} />
      <input type="number" placeholder="minY" value={minY} onChange={(e) => setMinY(e.target.value)} />
      <input type="number" placeholder="maxY" value={maxY} onChange={(e) => setMaxY(e.target.value)} />
      <button onClick={handleSearchBlocks}>Search Blocks</button>
    </div>
  );
};

const ZonesForm = ({ getZones }) => {
  const [id, setId] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [minX, setMinX] = useState('');
  const [maxX, setMaxX] = useState('');
  const [minY, setMinY] = useState('');
  const [maxY, setMaxY] = useState('');

  const handleSearchZones = () => {
    // Ваша логика для добавления блока
    getZones( id, author, content, minX, maxX, minY, maxY );

  };

  return (
    <div>
      {/* Ваши поля ввода для списка blocks */}
      <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)}/>
      <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <input type="text" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <input type="number" placeholder="minX" value={minX} onChange={(e) => setMinX(e.target.value)} />
      <input type="number" placeholder="maxX" value={maxX} onChange={(e) => setMaxX(e.target.value)} />
      <input type="number" placeholder="minY" value={minY} onChange={(e) => setMinY(e.target.value)} />
      <input type="number" placeholder="maxY" value={maxY} onChange={(e) => setMaxY(e.target.value)} />
      <button onClick={handleSearchZones}>Search Zones</button>
    </div>
  );
};

const UsersForm = ({ getUsers }) => {
  const [id, setId] = useState('');
  const [username, setUsername] = useState('');
  const [likes, setLikes] = useState('');

  const handleSearchUsers = () => {
    // Ваша логика для добавления блока
    getUsers( id, username, likes );

  };

  return (
    <div>
      {/* Ваши поля ввода для списка blocks */}
      <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
      <input type="text" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="text" placeholder="likes" value={likes} onChange={(e) => setLikes(e.target.value)} />
      <button onClick={handleSearchUsers}>Search users</button>
    </div>
  );
};

const RoomsForm = ({ getRooms }) => {
  const [minX, setMinX] = useState('');
  const [maxX, setMaxX] = useState('');
  const [minY, setMinY] = useState('');
  const [maxY, setMaxY] = useState('');

  const handleSearchRooms = () => {
    // Ваша логика для добавления блока
    getRooms( minX, maxX, minY, maxY );

  };

  return (
    <div>
      <input type="number" placeholder="minX" value={minX} onChange={(e) => setMinX(e.target.value)} />
      <input type="number" placeholder="maxX" value={maxX} onChange={(e) => setMaxX(e.target.value)} />
      <input type="number" placeholder="minY" value={minY} onChange={(e) => setMinY(e.target.value)} />
      <input type="number" placeholder="maxY" value={maxY} onChange={(e) => setMaxY(e.target.value)} />
      <button onClick={handleSearchRooms}>Search rooms</button>
    </div>
  );
};




// По аналогии создайте компоненты для списков zones, users, rooms

const TodoApp = ({ addBlock, addZone, editUser, setAdmin,
  getBlocks, getZones, getUsers, getRooms, 
  getConnections, count, todos, removeZone, removeBlock, removeUser }) => {
  const [selectedList, setSelectedList] = useState('blocks');
  const [lists] = useState(['blocks', 'zones', 'users', 'rooms']);

  const handleListChange = (e) => {
    setSelectedList(e.target.value);
  };

    useEffect(() => {
      const intervalId = setInterval(getConnections(), 1000);
  
      // Очищаем интервал при размонтировании компонента
      return () => clearInterval(intervalId);
    }, []);

  return (
    <div>
      <h2>Панель управления</h2>
      <h1>Человек на сайте: {count}</h1>
      <button onClick={() => setAdmin(false)}>
            Выйти
      </button>
      <div>
        <label htmlFor="list">Select a Todo List:</label>
        <select id="list" value={selectedList} onChange={handleListChange}>
          {lists.map((list) => (
            <option key={list} value={list}>
              {list}
            </option>
          ))}
        </select>
      </div>

      {selectedList === 'blocks' && <BlocksForm getBlocks={getBlocks} />}
      {selectedList === 'zones' && <ZonesForm getZones={getZones} />}
      {selectedList === 'users' && <UsersForm getUsers={getUsers} />}
      {selectedList === 'rooms' && <RoomsForm getRooms={getRooms} />}

      {selectedList === 'blocks' &&
      <div>
      <h2>{selectedList} Blocks:</h2>
      <ul>
        {todos['blocks'].map((block, index) => (
          <Block key={index}
          x={block.coords.x}
          y={block.coords.y}
          html={block.html}
          id={block.id}
          width={block.width}
          height={block.height}
          roomX={block.room.x}
          roomY={block.room.y}
          author={block.author}
          zone={block.zone}
          removeBlock={removeBlock}
          ></Block>
        ))}
      </ul>
      </div>}

      {selectedList === 'zones' &&
      <div>
      <h2>{selectedList} Zones:</h2>
      <ul>
        {todos['zones'].map((zone, index) => (
          <Zone key={index}
          x={zone.coords.x}
          y={zone.coords.y}
          content={zone.content}
          id={zone.id}
          width={zone.width}
          height={zone.height}
          roomX={zone.room.x}
          roomY={zone.room.y}
          author={zone.author}
          color={zone.color}
          removeZone={removeZone}
          ></Zone>
        ))}
      </ul>
      </div>}

      {selectedList === 'users' &&
      <div>
      <h2>{selectedList} Users:</h2>
      <ul>
        {todos['users'].map((user, index) => (
          <User key={index}
          id={user.id}
          username={user.username}
          password={user.password}
          color1={user.color1}
          color2={user.color2}
          subscribes={user.zones}
          myzones={user.myzones}  
          likes={user.likes}
          removeUser={removeUser}
          ></User>
        ))}
      </ul>
      </div>}

      {selectedList === 'rooms' &&
      <div>
      <h2>{selectedList} Rooms:</h2>
      <ul>
        {todos['rooms'].map((room, index) => (
          <Room key={index}
          x={room.coords.x}
          y={room.coords.y}
          cliens={room.cliens}
          zones={room.zones}
          blocks={room.blocks}
          ></Room>
        ))}
      </ul>
      </div>}

    </div>
  );
};

const Block = ({
  x, y, html, id, width, height, roomX, roomY, author, zone, removeBlock
}) => {
  return (
      <div>
          <button onClick={() => removeBlock(id, {x: roomX, y: roomY})}>
            x
          </button>

        <ul>
          <li>ID: {id}</li>
          <li>AUTHOR: {author}</li>
          <li>ZONE: {zone}</li>
          <li>X: {x} \ Y: {y}</li>
          <li>ROOM X: {roomX} \ ROOM Y: {roomY}</li>
          <li>WIDTH: {width} \ HEIGHT: {height}</li>
        </ul>

          <iframe
            srcDoc={html}
            loading="lazy"
            style={{  
                pointerEvents: 'all',
                width: '300px',
                height: '300px',
            }}>
          </iframe>
      </div>
    );
}

const Zone = ({
  x, y, content, color, id, width, height, roomX, roomY, author, removeZone
}) => {
  return (
      <div>
          <button onClick={() => removeZone(id, {x: roomX, y: roomY})}>
            x
          </button>

        <ul>
          <li>ID: {id}</li>
          <li>AUTHOR: {author}</li>
          <li>CONTENT: {content}</li>
          <li>COLOR: {color}</li>
          <li>X: {x} \ Y: {y}</li>
          <li>ROOM X: {roomX} \ ROOM Y: {roomY}</li>
          <li>WIDTH: {width} \ HEIGHT: {height}</li>
        </ul>
      </div>
    );
}

const Room = ({
  x, y, clients, blocks, zones, 
}) => {
  return (
      <div>
        <ul>
          <li>X: {x} \ Y: {y}</li>
          <li>CLIENTS:
            <ul>
              {clients.map((client, index) => (
                <li key={index}>{client}</li>
              ))}
            </ul>
          </li>
          <li>BLOCKS:
            <ul>
              {blocks.map((block, index) => (
                <li key={index}>{block.id}</li>
              ))}
            </ul>
          </li>
          <li>ZONES:
            <ul>
              {zones.map((zone, index) => (
                <li key={index}>{zone.content}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    );
}

const User = ({
  id, username, password, color1, color2, subscribes, myzones, likes, removeUser
}) => {
  return (
      <div>
          <button onClick={() => removeUser(username)}>
            x
          </button>

        <ul>
          <li>ID: {id}</li>
          <li>USERNAME: {username}</li>
          <li>PASSWORD: {password}</li>
          <li>COLOR1: {color1}</li>
          <li>COLOR2: {color2}</li>
          <li>SUBSCRIBES:
            <ul>
              {subscribes.map((zone, index) => (
                <li key={index}>{zone.content}</li>
              ))}
            </ul>
          </li>
          <li>MYZONES:
            <ul>
              {myzones.map((zone, index) => (
                <li key={index}>{zone.content}</li>
              ))}
            </ul>
          </li>
          <li>LIKES:
            <ul>
              {likes.map((like, index) => (
                <li key={index}>{like}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
    );
}

export default TodoApp;
