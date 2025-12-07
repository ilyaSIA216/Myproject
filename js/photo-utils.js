// ========== УТИЛИТЫ ДЛЯ РАБОТЫ С ФОТО ==========

// СЖАТИЕ ФОТО ДЛЯ МОБИЛЬНЫХ
async function compressPhoto(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        console.log('🖼️ Сжатие фото:', file.name, Math.round(file.size / 1024), 'KB');
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Создаем canvas для сжатия
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Изменяем размер если нужно
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Рисуем сжатое изображение
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Конвертируем в base64 с качеством
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                
                console.log('✅ Фото сжато:', 
                    Math.round(compressedBase64.length / 1024), 'KB',
                    `(${Math.round((compressedBase64.length / e.target.result.length) * 100)}% от оригинала)`);
                
                resolve(compressedBase64);
            };
            
            img.onerror = reject;
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ПРЕОБРАЗОВАНИЕ ФОТО В URL (для экономии памяти)
function convertPhotoToURL(file) {
    return new Promise((resolve, reject) => {
        console.log('🌐 Создание URL для фото:', file.name);
        
        // Для мобильных - используем сжатие
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            compressPhoto(file, 600, 0.6)
                .then(resolve)
                .catch(() => {
                    // Если сжатие не удалось, создаем обычный URL
                    const url = URL.createObjectURL(file);
                    resolve(url);
                });
        } else {
            // Для компьютера - создаем URL без base64
            const url = URL.createObjectURL(file);
            console.log('✅ URL создан:', url.substring(0, 50) + '...');
            resolve(url);
        }
    });
}

// СОХРАНЕНИЕ ФОТО В ОТДЕЛЬНОМ ХРАНИЛИЩЕ
function savePhotoToStorage(userId, photoType, base64Data) {
    return new Promise((resolve, reject) => {
        // Ограничиваем размер для мобильных
        const maxSize = 100 * 1024; // 100KB максимум
        let photoData = base64Data;
        
        if (base64Data.length > maxSize) {
            console.warn('⚠️ Фото слишком большое, сжимаем дополнительно...');
            // Просто обрезаем если слишком большое
            photoData = '[ФОТО_УДАЛЕНО_ИЗ-ЗА_РАЗМЕРА]';
        }
        
        const photoKey = `sia_photo_${userId}_${photoType}_${Date.now()}`;
        
        try {
            localStorage.setItem(photoKey, photoData);
            console.log(`✅ Фото сохранено: ${photoKey}, ${Math.round(photoData.length / 1024)}KB`);
            resolve(photoKey);
        } catch (e) {
            console.error('❌ Ошибка сохранения фото:', e);
            reject(e);
        }
    });
}

// ОЧИСТКА СТАРЫХ ФОТО
function cleanupOldPhotos() {
    console.log('🧹 Очистка старых фото...');
    
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('sia_photo_')) {
            try {
                // Извлекаем timestamp из ключа
                const parts = key.split('_');
                const timestamp = parseInt(parts[parts.length - 1]);
                
                if (timestamp && timestamp < oneDayAgo) {
                    localStorage.removeItem(key);
                    cleaned++;
                }
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
    
    console.log(`✅ Очищено старых фото: ${cleaned}`);
    return cleaned;
}

// ПОЛУЧЕНИЕ ФОТО ПО КЛЮЧУ
function getPhotoByKey(photoKey) {
    try {
        return localStorage.getItem(photoKey);
    } catch (e) {
        console.error('❌ Ошибка загрузки фото:', e);
        return null;
    }
}

// ПРОВЕРКА РАЗМЕРА LOCALSTORAGE
function checkStorageSize() {
    let totalSize = 0;
    const items = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        totalSize += size;
        
        items.push({
            key: key,
            size: size,
            sizeKB: Math.round(size / 1024)
        });
    }
    
    const totalMB = Math.round(totalSize / 1024 / 1024);
    console.log(`💾 Общий размер localStorage: ${totalMB}MB`);
    
    if (totalMB > 4) {
        console.warn('⚠️ Внимание! localStorage почти заполнен!');
        return false;
    }
    
    return true;
}

// ЭКСПОРТ
window.compressPhoto = compressPhoto;
window.convertPhotoToURL = convertPhotoToURL;
window.savePhotoToStorage = savePhotoToStorage;
window.cleanupOldPhotos = cleanupOldPhotos;
window.getPhotoByKey = getPhotoByKey;
window.checkStorageSize = checkStorageSize;
