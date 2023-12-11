const id = "%%id%%";
const name = "%%name%%"; // Измененные значения для name и author
const author = "%%author%%";

document.addEventListener("DOMContentLoaded", () => {
    const allContainer = document.getElementById("container");
    const container = document.getElementById("image-container");
    const colorPicker = document.getElementById("colorPicker");
    const textForm = document.getElementById("text-form");

    // Функция для обновления данных на сервере
    async function updateData(text, colour) {
        console.log("?????????");
        try {
            const response = await fetch("http://localhost:8000/upload_txt", {
                method: "POST",
                body: JSON.stringify({
                    id,
                    text,
                    colour,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            addImageToContainer(data);
        } catch (error) {
            console.error("Ошибка при отправке данных на сервер:", error);
        }
    }

    // Функция для отображения данных в контейнере
    function addImageToContainer(data) {
        container.innerHTML = ''; // Очищаем контейнер

        const item = document.createElement("div");
        item.classList.add("image-item");
        item.textContent = data.text;
        textForm.querySelector('textarea[name="text"]').value = data.text;
        colorPicker.value = data.colour;
        container.appendChild(item);
        allContainer.style.backgroundColor = data.colour;
        const isLight = luminance(data.colour) > 0.5;

        item.style.color = isLight ? '#000000' : '#ffffff';

        document.getElementById("input").style.color = isLight ? '#000000' : '#ffffff';
    }

    if (author !== name) {
        textForm.remove(); // Скрываем форму
        colorPicker.remove();
    } else {
        container.remove();
    colorPicker.addEventListener("change", () => {
        const newText = textForm.querySelector('textarea[name="text"]').value;
        const selectedColor = colorPicker.value;
        updateData(newText, selectedColor); // Отправляем только новый цвет
    });

    textForm.addEventListener("input", async (e) => {
        const newText = textForm.querySelector('textarea[name="text"]').value;
        const selectedColor = colorPicker.value;
        await updateData(newText, selectedColor); // Отправляем только новый текст
    });
}


function luminance(hex) {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}
    // Запрашиваем и отображаем данные с сервера
    async function fetchImageData() {
        try {
            const response = await fetch("http://localhost:8000/ask_txt", {
                method: "POST",
                body: JSON.stringify({
                    id,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            addImageToContainer(data);
        } catch (error) {
            console.error("Ошибка при получении данных с сервера:", error);
        }
    }

    fetchImageData(); // Запрашиваем и отображаем данные при загрузке страницы
});
