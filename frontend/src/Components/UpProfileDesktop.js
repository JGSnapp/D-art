import React, {useState} from 'react';
import styles from'../CSS/UpProfileDesktop.module.css';

const UpProfileDesktop = ({content, id, leave, tp, sub}) => {
    const zgl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxFd_W1I9sAJYUNAot1bna0r0I1FyXBAq_7w&usqp=CAU';
    const [imageSrc, setImageSrc] = useState(`http://192.168.0.117:8080/avas/${id}`);
    const handleError = () => {
        setImageSrc(zgl);
      };
    return (
        <div className={styles.modal}>
            <img 
                className={styles.img1}
                src={imageSrc}
                onError={handleError}>
            </img>
            <div className={styles.name}>{content}</div>

            <button 
                className={styles.button1} 
                style={{top: sub ? 'calc(95% - 50px)' : 'calc(97.5% - 25px)'}} 
                onClick={() => {tp(id)}}> Перейти 
            </button>
            
            {sub && 
                <button className={styles.button2} onClick={() => {leave(id)}}> Отменить подписку </button>
            }
        </div>
    );
}

export default UpProfileDesktop;