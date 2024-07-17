import React, { useState, useEffect } from 'react';

const HTML = ({inputHtml, isEdit}) => {
  const [outputUrl, setOutputUrl] = useState('');

  useEffect(() => {
    showOutput();
  }, []);

  const showOutput = () => {
    // Создать blob из HTML-кода
    const blob = new Blob([inputHtml], { type: 'text/html' });
    // Получить URL blob
    const url = URL.createObjectURL(blob);
    // Установить URL blob в качестве источника для блока object
    setOutputUrl(url);
  };

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