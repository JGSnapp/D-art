const id = "%%id%%";
const name = "%%name%%"; // Измененные значения для name и author
const author = "%%author%%";
console.log("no");

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("image-container");
    const form = document.getElementById("upload-form");

    // Проверяем условие для отображения элементов загрузки
    if (author !== name) {
        form.style.display = "none"; // Скрываем форму
    } else {

        // Добавляем слушатель события "change" для input файла
        const fileInput = form.querySelector('input[type="file"]');
        fileInput.addEventListener("change", async (e) => {
            try {
                console.log("?????????");
                const formData = new FormData(form);
                const response = await fetch("http://localhost:8000/upload", {
                    method: "POST",
                    body: formData,
                    headers: {
                        "id": id
                    }
                });
                const data = await response.json();
                addImageToContainer(data);
            } catch (e) {
                console.log("no");
            }
        });
    }

    // Остальной ваш JS код остается без изменений.

    async function fetchImageById() {
        try {
            const response = await fetch("http://localhost:8000/ask", {
                method: "POST",
                headers: {
                    "id": id
                }
            });
            const data = await response.json();
            addImageToContainer(data);
        } catch (e) {
            console.log("no");
        }
    }

    function addImageToContainer(imageInfo) {
        // Очищаем контейнер перед добавлением старой картинки
        container.innerHTML = '';

        const imageItem = document.createElement("div");
        imageItem.classList.add("image-item");

        const image = document.createElement("img");
        image.src = imageInfo.url;

        const imageName = document.createElement("p");

        imageItem.appendChild(image);
        imageItem.appendChild(imageName);
        container.appendChild(imageItem);
    }

    fetchImageById();
});
