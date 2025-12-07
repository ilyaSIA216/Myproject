// ФУНКЦИИ ДЛЯ РАБОТЫ С ФОТО
function compressPhoto(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Неверный тип файла'));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let width = img.width;
                let height = img.height;

                // Сохраняем пропорции
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Конвертируем в JPEG
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Функция для предпросмотра основного фото
function previewMainPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    compressPhoto(file)
        .then(compressed => {
            const preview = document.getElementById('main-photo-preview');
            preview.src = compressed;
            preview.style.display = 'block';
            
            // Сохраняем в глобальной переменной
            window.currentMainPhoto = compressed;
        })
        .catch(err => {
            console.error('Ошибка сжатия фото:', err);
            alert('Не удалось обработать фото');
        });
}

// Функция для предпросмотра селфи
function previewSelfie(event) {
    const file = event.target.files[0];
    if (!file) return;

    compressPhoto(file)
        .then(compressed => {
            const preview = document.getElementById('selfie-preview');
            preview.src = compressed;
            preview.style.display = 'block';
            
            // Сохраняем в глобальной переменной
            window.currentSelfie = compressed;
        })
        .catch(err => {
            console.error('Ошибка сжатия селфи:', err);
            alert('Не удалось обработать фото');
        });
}

// Экспортируем функции
window.compressPhoto = compressPhoto;
window.previewMainPhoto = previewMainPhoto;
window.previewSelfie = previewSelfie;
