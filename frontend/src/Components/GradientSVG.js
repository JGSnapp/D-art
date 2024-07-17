import React, { useState, useEffect } from 'react';

const GradientSVG = ({color1, color2}) => {
    const [colors, setColors] = useState(["#000000", "#000000", "#000000", "#000000"]);
  
    useEffect(() => {
      const newColors = [...colors];
      newColors[0] = color1;
      newColors[1] = color2;
      newColors[2] = darkenColor(color1, 30);
      newColors[3] = darkenColor(color2, 30);
      console.log(newColors);
      setColors(newColors);
    }, [color1, color2]);

  const darkenColor = (color, percent) => {
    // Функция для затемнения цвета на заданный процент
    const hex = color.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const darken = (value) => Math.round(value * (1 - percent / 100));

    const darkenedR = darken(r);
    const darkenedG = darken(g);
    const darkenedB = darken(b);

    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG
      .toString(16)
      .padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  };

  return (
      <svg width="50" height="48.6" viewBox="0 0 500 486" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M123.512 70.232C197.499 20.3883 284.415 3.95258 318.624 1.96519C353.828 -3.59949 433.305 -0.658157 469.583 55.6247C565.648 204.381 411.706 459.561 318.624 484.304C225.543 509.047 107.998 255.655 136.639 204.977C179.897 162.944 264.327 180.234 253.885 229.422C243.443 278.61 281.034 364.763 318.624 366.253C356.215 367.744 468.986 181.724 403.651 116.439C338.315 51.153 243.742 116.439 157.224 146.548C88.0095 170.635 23.5687 136.511 0 116.439C10.3424 121.805 49.524 120.076 123.512 70.232Z" fill={`url(#paint0_linear_46_2)`} />
        <path d="M117.089 72.6192C187.229 25.3395 269.625 9.74926 302.056 7.8641C335.429 2.58567 410.773 5.3757 445.165 58.7633C536.234 199.867 390.297 441.921 302.056 465.391C213.815 488.862 102.382 248.504 129.533 200.433C170.543 160.562 250.582 176.963 240.683 223.62C230.784 270.278 266.42 351.999 302.056 353.413C337.692 354.827 444.599 178.376 382.661 116.449C320.722 54.5217 231.067 116.449 149.048 145.009C83.433 167.857 22.3431 135.489 0 116.449C9.80456 121.539 46.9488 119.899 117.089 72.6192Z" fill={`url(#paint1_linear_46_2)`} />
        <defs>
          <linearGradient id="paint0_linear_46_2" x1="250" y1="0" x2="250" y2="486" gradientUnits="userSpaceOnUse">
            <stop stopColor={colors[2]} />
            <stop offset="1" stopColor={colors[3]} />
          </linearGradient>
          <linearGradient id="paint1_linear_46_2" x1="237" y1="6" x2="237" y2="467" gradientUnits="userSpaceOnUse">
            <stop stopColor={colors[0]} />
            <stop offset="1" stopColor={colors[1]} />
          </linearGradient>
        </defs>
      </svg>
  );
};

export default GradientSVG;

