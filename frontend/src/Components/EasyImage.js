import React, { useState, useEffect } from 'react';
import styles from '../CSS/EasyImage.module.css';

const App = ({html, isEdit}) => {
  const [id, author, name] = html.split(';');

  const [imageInfo, setImageInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://d-art.space/blocks/ask_image", {
          method: "POST",
          headers: {
            "id": id
          }
        });
        const data = await response.json();
        setImageInfo(data);
      } catch (error) {
        console.error("Failed to fetch image:", error);
      }
    };
    console.log(id, " ",  author, " ", name)
    fetchData();
  }, [id]);

  const handleFileChange = async (e) => {
    try {
      const formData = new FormData();
      formData.append('image', e.target.files[0]);

      const response = await fetch("https://d-art.space/blocks/upload_image", {
        method: "POST",
        body: formData,
        headers: {
          "id": id
        }
      });

      const data = await response.json();
      setImageInfo(data);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  return (
    <div             style={{  
      position: 'absolute',
      top: isEdit ? '-2px' : '0px',
      left: isEdit ? '-2px' : '0px',
      pointerEvents: isEdit ? 'none' : 'all',
      height: '100%',
      width: '100%',
      border: 'none',
      }}>
      <form className={styles.form} encType="multipart/form-data">
        {author === name ? (
          <label className={styles.input_file}>
            <input
              type="file"
              name="image"
              accept="image/*"
              className={styles.span}
              onChange={handleFileChange}
            />
            <span>Добавить/Заменить</span>
          </label>
        ) : null}
      </form>

      <div className={styles.image_container}>
        {imageInfo && (
          <img
            className={styles.image_item}
            src={imageInfo.url}
            alt="Uploaded"
          />
        )}
      </div>
    </div>
  );
};

export default App;
