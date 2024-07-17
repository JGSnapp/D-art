import React, { useState, useEffect } from 'react';

const HTML = ({id, isEdit}) => {
  const [outputUrl, setOutputUrl] = useState('');

  useEffect(() => {
    // Загрузка HTML-контента с сервера
    fetch('C:\Users\JGSnapp\Desktop\app__16x\backend\blocks\__image\index.html')
      .then(response => response.text())
      .then(data => setOutputUrl(data))
      .catch(error => console.error('Error fetching HTML:', error));
  }, []);

  return (
      <object
        id="output"
        data={outputUrl}
        type="text/html"
        style={{  
          height: "100%",
          width: "100%",
          border: "none",
          position: 'absolute',
          top: isEdit ? '-2px' : '0px',
          left: isEdit ? '-2px' : '0px',
          pointerEvents: isEdit ? 'none' : 'all',
        }}
      ></object>

  );
};

export default HTML;
