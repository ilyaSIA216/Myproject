// ========== УТИЛИТЫ ДЛЯ SiaMatch (УПРОЩЕННЫЕ) ==========

// ГЛАВНАЯ ФУНКЦИЯ ОТПРАВКИ - БЕЗ ФОТО
function submitForModeration(userData) {
    console.log('🚀 === ОТПРАВКА ЗАЯВКИ (упрощенная) ===');
    
    // Проверяем свободное место
    if (!checkStorageSizeQuick()) {
        alert('⚠️ Недостаточно места для сохранения. Очистите старые данные.');
        return null;
    }
    
    // 1. Гарантируем ID
    if (!userData.id) {
        userData.id = Date.now();
        console.log('📝 Создан ID:', userData.id);
    }
    
    // 2. Сохраняем пользователя (БЕЗ ФОТО)
    const simpleUserData = {
        id: userData.id,
        name: userData.name,
        age: userData.age,
        city: userData.city,
        gender: userData.gender,
        bio: userData.bio || "Пользователь SiaMatch"
    };
    
    try {
        localStorage.setItem('sia_current_user', JSON.stringify(simpleUserData));
        localStorage.setItem('sia_current_user_id', userData.id.toString());
        console.log('✅ Пользователь сохранен');
    } catch (e) {
        console.error('❌ Ошибка сохранения пользователя');
    }
    
    // 3. Создаем заявку (БЕЗ ФОТО В ОСНОВНОМ ХРАНИЛИЩЕ)
    const newApplication = {
        id: userData.id,
        name: userData.name || 'Неизвестно',
        age: userData.age || 18,
        city: userData.city || 'Не указан',
        gender: userData.gender || 'unknown',
        bio: userData.bio || "Пользователь SiaMatch",
        status: 'pending',
        submittedAt: new Date().toISOString(),
        applicationId: 'APP-' + Date.now().toString().slice(-6),
        
        // ФЛАГИ что фото были загружены (но не сами фото)
        hasMainPhoto: !!userData.mainPhoto,
        hasSelfie: !!userData.selfie,
        
        // ВРЕМЕННЫЕ URL для фото (если это не base64)
        mainPhotoUrl: userData.mainPhoto && !userData.mainPhoto.startsWith('data:') ? userData.mainPhoto : null,
        selfieUrl: userData.selfie && !userData.selfie.startsWith('data:') ? userData.selfie : null
    };
    
    console.log('📋 Заявка создана:', newApplication.name, newApplication.applicationId);
    
    // 4. Получаем существующие заявки
    let pendingUsers = getPendingApplicationsSafe();
    
    // 5. Проверяем дубликаты
    const existingIndex = pendingUsers.findIndex(u => u.id === userData.id);
    if (existingIndex !== -1) {
        pendingUsers[existingIndex] = newApplication;
        console.log('⚠️ Заявка обновлена');
    } else {
        pendingUsers.push(newApplication);
        console.log('➕ Новая заявка добавлена');
    }
    
    // 6. Сохраняем заявки (ограничиваем количество)
    try {
        // Оставляем только последние 50 заявок
        const toSave = pendingUsers.slice(-50);
        
        // Удаляем любые большие данные перед сохранением
        const cleaned = toSave.map(app => {
            const cleanApp = { ...app };
            
            // Удаляем любые base64 строки
            if (cleanApp.mainPhoto && cleanApp.mainPhoto.startsWith('data:')) {
                cleanApp.mainPhoto = null;
            }
            if (cleanApp.selfie && cleanApp.selfie.startsWith('data:')) {
                cleanApp.selfie = null;
            }
            
            return cleanApp;
        });
        
        localStorage.setItem('sia_pending_users', JSON.stringify(cleaned));
        console.log('✅ Заявки сохранены:', cleaned.length);
        
    } catch (e) {
        console.error('❌ Ошибка сохранения заявок:', e);
        
        // Экстренное сохранение - только основные данные
        try {
            const emergencyData = pendingUsers.slice(-10).map(app => ({
                id: app.id,
                name: app.name,
                age: app.age,
                city: app.city,
                status: app.status,
                applicationId: app.applicationId
            }));
            
            localStorage.setItem('sia_pending_users_emergency', JSON.stringify(emergencyData));
            console.log('⚠️ Экстренное сохранение:', emergencyData.length);
        } catch (e2) {
            console.error('❌ Критическая ошибка!');
            return null;
        }
    }
    
    // 7. Если есть фото - сохраняем их ОТДЕЛЬНО
    if (userData.mainPhoto && userData.mainPhoto.startsWith('data:')) {
        setTimeout(() => {
            savePhotoSeparately(userData.id, 'main', userData.mainPhoto)
                .then(key => {
                    console.log('✅ Основное фото сохранено отдельно');
                })
                .catch(err => {
                    console.log('⚠️ Не удалось сохранить фото');
                });
        }, 100);
    }
    
    if (userData.selfie && userData.selfie.startsWith('data:')) {
        setTimeout(() => {
            savePhotoSeparately(userData.id, 'selfie', userData.selfie)
                .then(key => {
                    console.log('✅ Селфи сохранено отдельно');
                })
                .catch(err => {
                    console.log('⚠️ Не удалось сохранить селфи');
                });
        }, 200);
    }
    
    // 8. Уведомление для админа
    createAdminNotification(newApplication);
    
    console.log('🎉 === ЗАЯВКА ОТПРАВЛЕНА ===');
    return userData.id;
}

// БЫСТРАЯ ПРОВЕРКА РАЗМЕРА ХРАНИЛИЩА
function checkStorageSizeQuick() {
    try {
        // Проверяем только ключевые данные
        const pending = localStorage.getItem('sia_pending_users') || '';
        const active = localStorage.getItem('sia_active_users') || '';
        const current = localStorage.getItem('sia_current_user') || '';
        
        const totalSize = pending.length + active.length + current.length;
        
        if (totalSize > 4000000) { // 4MB
            console.warn('⚠️ Мало свободного места:', Math.round(totalSize / 1024 / 1024), 'MB');
            return false;
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

// СОХРАНЕНИЕ ФОТО ОТДЕЛЬНО (асинхронное)
async function savePhotoSeparately(userId, type, base64Data) {
    return new Promise((resolve, reject) => {
        // Сжимаем фото если оно слишком большое
        if (base64Data.length > 100000) { // > 100KB
            console.log(`🖼️ Сжимаем ${type} фото...`);
            
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Уменьшаем размер
                const maxSize = 600;
                let width = img.width;
                let height = img.height;
                
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressed = canvas.toDataURL('image/jpeg', 0.6);
                
                // Сохраняем сжатое фото
                const photoKey = `sia_photo_${userId}_${type}`;
                try {
                    localStorage.setItem(photoKey, compressed);
                    console.log(`✅ ${type} фото сохранено (сжато):`, Math.round(compressed.length / 1024), 'KB');
                    resolve(photoKey);
                } catch (e) {
                    reject(e);
                }
            };
            
            img.onerror = reject;
            img.src = base64Data;
        } else {
            // Сохраняем как есть
            const photoKey = `sia_photo_${userId}_${type}`;
            try {
                localStorage.setItem(photoKey, base64Data);
                console.log(`✅ ${type} фото сохранено:`, Math.round(base64Data.length / 1024), 'KB');
                resolve(photoKey);
            } catch (e) {
                reject(e);
            }
        }
    });
}

// ПОЛУЧЕНИЕ ФОТО ПОЛЬЗОВАТЕЛЯ
function getUserPhotos(userId) {
    const mainKey = `sia_photo_${userId}_main`;
    const selfieKey = `sia_photo_${userId}_selfie`;
    
    return {
        mainPhoto: localStorage.getItem(mainKey),
        selfie: localStorage.getItem(selfieKey)
    };
}

// ОСТАЛЬНЫЕ ФУНКЦИИ (упрощенные)
function getPendingApplicationsSafe() {
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Ошибка загрузки заявок');
    }
    return [];
}

function createAdminNotification(userData) {
    try {
        let notifications = [];
        const stored = localStorage.getItem('sia_admin_notifications');
        if (stored) {
            notifications = JSON.parse(stored);
        }
        
        const notification = {
            id: Date.now(),
            userId: userData.id,
            name: userData.name,
            city: userData.city,
            time: new Date().toLocaleString('ru-RU'),
            hasPhoto: userData.hasMainPhoto,
            hasSelfie: userData.hasSelfie
        };
        
        notifications.push(notification);
        localStorage.setItem('sia_admin_notifications', JSON.stringify(notifications.slice(-20)));
        
    } catch (e) {
        // Игнорируем ошибки уведомлений
    }
}

// ЭКСПОРТ
window.submitForModeration = submitForModeration;
window.getUserPhotos = getUserPhotos;
window.getPendingApplicationsSafe = getPendingApplicationsSafe;
