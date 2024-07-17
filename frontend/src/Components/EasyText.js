import React, { useState, useEffect, useRef } from 'react';
import styles from '../CSS/EasyText.module.css';

const ImageUpload = ({html, isEdit}) => {
  const [id, author, name] = html.split(';');
  const [text, setText] = useState("");
  const [colour, setColour] = useState("#ffffff");
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://d-art.space/blocks/ask_txt", {
          method: "POST",
          body: JSON.stringify({ id }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        updateImageData(data);
      } catch (error) {
        console.error("Error fetching data from the server:", error);
      }
    };
    console.log(id, " ",  author, " ", name)
    fetchData();
  }, [id]);

  const updateImageData = (data) => {
    setText(data.text);
    setColour(data.colour);
    setIsLight(luminance(data.colour) > 0.5);
  };

  const luminance = (hex) => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const updateData = async (text, colour) => {
    try {
      const a = JSON.stringify({ id, text, colour })
      console.log(a);
      const response = await fetch("https://d-art.space/blocks/upload_txt", {
        method: "POST",
        body: a,
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
      updateImageData(data);
    } catch (error) {
      console.error("Error sending data to the server:", error);
    }
  };

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    setColour(selectedColor);
    updateData(text, selectedColor);
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    updateData(newText, colour);
  };

  return (
    <div className="container" 
    style={{  
      position: 'absolute',
      top: isEdit ? '-2px' : '0px',
      left: isEdit ? '-2px' : '0px',
      pointerEvents: isEdit ? 'none' : 'all',
      height: '100%',
      width: '100%',
      border: 'none',
      backgroundColor: colour,
      }}
    >
      {author === name ? (
        <>
          <input type="color" className={styles.colorpicker} value={colour} onChange={handleColorChange} />
          <form className={styles.textform}>
            <label className={styles.inputfile}>
              <textarea
                type="text"
                name="text"
                accept="text/*"
                className={styles.input}
                id="input"
                placeholder=""
                value={text}
                onChange={handleTextChange}
                style={{ 
                  color: isLight ? '#000000' : '#ffffff',
                  fontSize: '30px',
                  textAlign: 'center', }}
                  ></textarea>
            </label>
          </form>
        </>
      ) : (
        <div className={styles.image_container}>
          <div className={styles.image_item} 
          style={{ 
            color: isLight ? '#000000' : '#ffffff',
            fontSize: '30px',
            textAlign: 'center', }}>
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
