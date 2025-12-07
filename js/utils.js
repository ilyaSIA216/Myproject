// ========== УТИЛИТЫ ДЛЯ SiaMatch ==========

// Мок Telegram WebApp
window.Telegram = {
    WebApp: {
        initData: '',
        initDataUnsafe: {
            user: {
                id: Math.floor(Math.random() * 1000000),
                first_name: 'Тестовый',
                last_name: 'Пользователь'
            }
        },
        ready: function() {
            console.log('Telegram WebApp ready');
        },
        expand: function() {
            console.log('WebApp expanded');
        },
        close: function() {
            console.log('Closing WebApp');
        }
    }
};

if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

// ========== УТИЛИТЫ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ==========

function getCurrentUser() {
    try {
        const stored = localStorage.getItem('sia_current_user');
        if (!stored || stored === 'undefined') {
            return null;
        }
        const user = JSON.parse(stored);
        return user;
    } catch (e) {
        console.error('Ошибка получения пользователя:', e);
        return null;
    }
}

function saveUser(userData) {
    try {
        // Сохраняем только основные данные
        const simplifiedUser = {
            id: userData.id,
            name: userData.name,
            age: userData.age,
            city: userData.city,
            gender: userData.gender,
            bio: userData.bio || "Пользователь SiaMatch"
        };
        
        localStorage.setItem('sia_current_user', JSON.stringify(simplifiedUser));
        console.log('✅ Пользователь сохранен:', simplifiedUser.name);
        return simplifiedUser;
    } catch (e) {
        console.error('❌ Ошибка сохранения пользователя:', e);
        return null;
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== СПИСОК ГОРОДОВ РОССИИ ==========

const russianCities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград",
    "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск"
].sort();

// ========== АВТОПРОВЕРКА АВТОРИЗАЦИИ ==========

function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard.html') && !currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (currentPath.includes('index.html') && currentUser) {
        const status = checkUserStatus(currentUser.id);
        if (status === 'approved') {
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    return true;
}

document.addEventListener('DOMContentLoaded', checkAuth);

// ========== СИСТЕМА МОДЕРАЦИИ ==========

// КРИТИЧЕСКО ВАЖНАЯ ФУНКЦИЯ: Отправка заявки на модерацию
function submitForModeration(userData) {
    console.log('🚀 === НАЧАЛО submitForModeration ===');
    
    // 1. Проверяем входные данные
    if (!userData || !userData.name) {
        console.error('❌ Нет данных пользователя');
        return null;
    }
    
    // 2. Создаем ID если его нет
    if (!userData.id) {
        userData.id = Date.now();
        console.log('📝 Создан ID:', userData.id);
    }
    
    // 3. Сохраняем пользователя
    saveUser(userData);
    
    // 4. Сохраняем ID отдельно
    localStorage.setItem('sia_current_user_id', userData.id.toString());
    console.log('🔑 ID сохранен:', userData.id);
    
    // 5. Создаем заявку для модерации
    const newApplication = {
        id: userData.id,
        name: userData.name || 'Неизвестно',
        age: userData.age || 18,
        city: userData.city || 'Не указан',
        gender: userData.gender || 'unknown',
        bio: userData.bio || "Пользователь SiaMatch",
        status: 'pending',
        submittedAt: new Date().toISOString(),
        applicationId: 'APP-' + Date.now().toString().slice(-8),
        mainPhoto: userData.mainPhoto || '',
        selfie: userData.selfie || '',
        moderatedAt: null,
        moderator: null,
        rejectionReason: null
    };
    
    console.log('📋 Заявка создана:', {
        id: newApplication.id,
        name: newApplication.name,
        status: newApplication.status,
        applicationId: newApplication.applicationId
    });
    
    // 6. Получаем текущие заявки
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            pendingUsers = JSON.parse(stored);
            console.log('📊 Найдено существующих заявок:', pendingUsers.length);
        }
    } catch (e) {
        console.error('❌ Ошибка чтения заявок:', e);
        pendingUsers = [];
    }
    
    // 7. Проверяем, нет ли уже такой заявки
    const existingIndex = pendingUsers.findIndex(u => u.id === userData.id);
    
    if (existingIndex !== -1) {
        console.log('⚠️ Заявка уже существует, обновляем');
        pendingUsers[existingIndex] = newApplication;
    } else {
        console.log('➕ Добавляем новую заявку');
        pendingUsers.push(newApplication);
    }
    
    // 8. Сохраняем заявки
    try {
        // Для мобильных устройств сохраняем без фото
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const simplifiedApplications = pendingUsers.map(app => ({
                id: app.id,
                name: app.name,
                age: app.age,
                city: app.city,
                gender: app.gender,
                bio: app.bio,
                status: app.status,
                submittedAt: app.submittedAt,
                applicationId: app.applicationId,
                hasMainPhoto: !!app.mainPhoto,
                hasSelfie: !!app.selfie
            }));
            
            localStorage.setItem('sia_pending_users', JSON.stringify(simplifiedApplications));
            console.log('📱 Сохранено для мобильных устройств');
        } else {
            localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
        }
        
        console.log('✅ Заявки сохранены. Всего:', pendingUsers.length);
        
        // 9. Проверяем сохранение
        const verify = localStorage.getItem('sia_pending_users');
        if (verify) {
            const parsed = JSON.parse(verify);
            console.log('✅ Проверка: сохранено заявок:', parsed.length);
        } else {
            console.error('❌ Проверка: данные не сохранены!');
        }
        
    } catch (e) {
        console.error('❌ Ошибка сохранения заявок:', e);
        
        // Пробуем сохранить только основные данные
        try {
            const minimalData = pendingUsers.map(app => ({
                id: app.id,
                name: app.name,
                age: app.age,
                city: app.city,
                gender: app.gender,
                status: app.status,
                applicationId: app.applicationId
            }));
            
            localStorage.setItem('sia_pending_users', JSON.stringify(minimalData));
            console.log('✅ Сохранены минимальные данные');
        } catch (e2) {
            console.error('❌ Не удалось сохранить даже минимальные данные');
        }
    }
    
    // 10. Создаем уведомление для админа
    createAdminNotification(userData);
    
    console.log('🎉 === submitForModeration ЗАВЕРШЕН ===');
    return userData.id;
}

// Создание уведомления для администратора
function createAdminNotification(userData) {
    try {
        let notifications = [];
        const stored = localStorage.getItem('sia_admin_notifications');
        if (stored && stored !== 'undefined') {
            notifications = JSON.parse(stored);
        }
        
        const notification = {
            id: Date.now(),
            userId: userData.id,
            applicationId: 'APP-' + Date.now().toString().slice(-8),
            name: userData.name,
            gender: userData.gender === 'male' ? 'Мужчина' : 'Женщина',
            age: userData.age,
            city: userData.city,
            time: new Date().toLocaleString('ru-RU'),
            type: 'new_application',
            read: false
        };
        
        notifications.push(notification);
        
        // Сохраняем только последние 20 уведомлений
        localStorage.setItem('sia_admin_notifications', JSON.stringify(notifications.slice(-20)));
        console.log('📢 Уведомление для админа создано');
    } catch (e) {
        console.log('⚠️ Не удалось создать уведомление для админа');
    }
}

// Проверка статуса пользователя
function checkUserStatus(userId) {
    if (!userId) return 'not_found';
    
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined') {
            const pendingUsers = JSON.parse(stored);
            const user = pendingUsers.find(u => u.id == userId);
            
            if (user) {
                return user.status || 'pending';
            }
        }
        
        // Проверяем активных пользователей
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        const activeUser = activeUsers.find(u => u.id == userId);
        
        if (activeUser) {
            return 'approved';
        }
        
        return 'not_found';
    } catch (e) {
        console.error('Ошибка проверки статуса:', e);
        return 'not_found';
    }
}

// Проверка доступа для дашборда
function checkDashboardAccess() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        return { allowed: false, reason: 'Пользователь не найден', code: 'no_user' };
    }
    
    const status = checkUserStatus(currentUser.id);
    
    if (status === 'pending') {
        return { 
            allowed: false, 
            reason: 'Ваша анкета находится на проверке', 
            code: 'pending'
        };
    } else if (status === 'rejected') {
        return { 
            allowed: false, 
            reason: 'Ваша анкета не прошла модерацию', 
            code: 'rejected'
        };
    } else if (status === 'approved') {
        return { 
            allowed: true, 
            reason: 'Доступ разрешен', 
            code: 'approved',
            user: currentUser
        };
    } else {
        return { 
            allowed: false, 
            reason: 'Статус вашей анкеты неизвестен', 
            code: 'unknown'
        };
    }
}

// Получение активных пользователей для свайпов
function getActiveUsers(currentUserId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    let activeUsers = [];
    try {
        activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    } catch (e) {
        activeUsers = [];
    }
    
    // Если нет активных пользователей, создаем тестовых
    if (activeUsers.length === 0) {
        activeUsers = [
            {
                id: 1001,
                name: "Анна",
                age: 24,
                city: "Москва",
                gender: "female",
                bio: "Люблю путешествия и кофе",
                photo: "https://randomuser.me/api/portraits/women/1.jpg"
            },
            {
                id: 1002,
                name: "Мария",
                age: 26,
                city: "Санкт-Петербург",
                gender: "female",
                bio: "Фотограф, ищу интересного собеседника",
                photo: "https://randomuser.me/api/portraits/women/2.jpg"
            },
            {
                id: 1003,
                name: "Екатерина",
                age: 22,
                city: "Казань",
                gender: "female",
                bio: "Студентка, увлекаюсь искусством",
                photo: "https://randomuser.me/api/portraits/women/3.jpg"
            },
            {
                id: 1004,
                name: "Дмитрий",
                age: 28,
                city: "Новосибирск",
                gender: "male",
                bio: "Программист, люблю спорт",
                photo: "https://randomuser.me/api/portraits/men/1.jpg"
            },
            {
                id: 1005,
                name: "Алексей",
                age: 25,
                city: "Екатеринбург",
                gender: "male",
                bio: "Дизайнер, увлекаюсь фотографией",
                photo: "https://randomuser.me/api/portraits/men/2.jpg"
            }
        ];
        
        localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
    }
    
    // Фильтруем по противоположному полу и исключаем текущего
    return activeUsers.filter(user => {
        const isOppositeGender = 
            (currentUser.gender === 'male' && user.gender === 'female') ||
            (currentUser.gender === 'female' && user.gender === 'male');
        
        return isOppositeGender && user.id !== currentUserId;
    });
}

// ========== ФУНКЦИИ ДЛЯ ОТЛАДКИ ==========

// Отладочная функция: показывает все данные в системе
function debugSystem() {
    console.log('=== 🔍 ДЕБАГ СИСТЕМЫ SiaMatch ===');
    
    console.log('\n📱 ТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ:');
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log('✅', currentUser);
    } else {
        console.log('❌ Нет текущего пользователя');
    }
    
    console.log('\n📋 ЗАЯВКИ НА МОДЕРАЦИЮ:');
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            const apps = JSON.parse(stored);
            console.log(`📊 Всего заявок: ${apps.length}`);
            
            if (apps.length > 0) {
                apps.forEach((app, i) => {
                    console.log(`${i+1}. ${app.name} (${app.age} лет) - ${app.status}`);
                });
            } else {
                console.log('📭 Нет заявок');
            }
        } else {
            console.log('📭 Нет данных о заявках');
        }
    } catch (e) {
        console.error('❌ Ошибка чтения заявок:', e);
    }
    
    console.log('\n👥 АКТИВНЫЕ ПОЛЬЗОВАТЕЛИ:');
    try {
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        console.log(`👥 Активных пользователей: ${activeUsers.length}`);
    } catch (e) {
        console.log('⚠️ Нет активных пользователей');
    }
    
    console.log('\n💾 LOCALSTORAGE КЛЮЧИ:');
    ['sia_current_user', 'sia_current_user_id', 'sia_pending_users', 'sia_active_users', 'sia_admin_notifications'].forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`✅ ${key}: есть (${value.length} символов)`);
        } else {
            console.log(`❌ ${key}: нет`);
        }
    });
    
    console.log('=== 🔍 ДЕБАГ ЗАВЕРШЕН ===');
}

// Создание тестовой заявки
function createTestApplication() {
    const testUser = {
        id: Date.now(),
        name: "Тестовый Пользователь",
        age: 25,
        city: "Москва",
        gender: "male",
        bio: "Это тестовый пользователь для отладки",
        mainPhoto: "",
        selfie: ""
    };
    
    console.log('🧪 Создаем тестовую заявку...');
    const result = submitForModeration(testUser);
    
    if (result) {
        console.log('✅ Тестовая заявка создана!');
        showNotification('✅ Тестовая заявка создана! Проверьте админ-панель.', 'success');
        
        // Обновляем страницу через секунду
        setTimeout(() => {
            if (window.location.pathname.includes('admin.html')) {
                window.location.reload();
            }
        }, 1000);
    } else {
        console.error('❌ Ошибка создания тестовой заявки');
        showNotification('❌ Ошибка создания тестовой заявки', 'error');
    }
}

// Восстановление данных админ-панели
function repairAdminData() {
    console.log('🔧 Восстановление данных админ-панели...');
    
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined') {
            pendingUsers = JSON.parse(stored);
        }
    } catch (e) {
        console.log('❌ Ошибка чтения, очищаем данные');
        localStorage.removeItem('sia_pending_users');
        pendingUsers = [];
    }
    
    // Исправляем структуру данных
    const repairedUsers = pendingUsers.map(user => {
        return {
            id: user.id || Date.now(),
            name: user.name || 'Неизвестно',
            age: user.age || 18,
            city: user.city || 'Не указан',
            gender: user.gender || 'unknown',
            status: user.status || 'pending',
            submittedAt: user.submittedAt || new Date().toISOString(),
            applicationId: user.applicationId || 'APP-' + Date.now().toString().slice(-6),
            bio: user.bio || 'Пользователь SiaMatch'
        };
    });
    
    try {
        localStorage.setItem('sia_pending_users', JSON.stringify(repairedUsers));
        console.log(`✅ Данные восстановлены: ${repairedUsers.length} заявок`);
        showNotification(`✅ Данные восстановлены: ${repairedUsers.length} заявок`, 'success');
        return repairedUsers;
    } catch (e) {
        console.log('❌ Не удалось восстановить данные');
        showNotification('❌ Не удалось восстановить данные', 'error');
        return [];
    }
}

// Очистка всех данных
function clearAllData() {
    if (confirm('⚠️ Вы уверены, что хотите очистить ВСЕ данные? Это действие нельзя отменить.')) {
        localStorage.removeItem('sia_current_user');
        localStorage.removeItem('sia_current_user_id');
        localStorage.removeItem('sia_pending_users');
        localStorage.removeItem('sia_active_users');
        localStorage.removeItem('sia_admin_notifications');
        
        console.log('🧹 Все данные очищены');
        showNotification('✅ Все данные очищены', 'success');
        
        // Если мы в админ-панели, обновляем
        if (window.location.pathname.includes('admin.html')) {
            setTimeout(() => window.location.reload(), 1500);
        }
    }
}

// Проверка состояния localStorage
function checkStorage() {
    console.log('=== 📊 ПРОВЕРКА LOCALSTORAGE ===');
    
    const keys = ['sia_current_user', 'sia_current_user_id', 'sia_pending_users', 'sia_active_users'];
    let totalSize = 0;
    
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            const size = value.length;
            totalSize += size;
            console.log(`${key}: ${size} символов (${Math.round(size / 1024)} KB)`);
        } else {
            console.log(`${key}: ❌ не найден`);
        }
    });
    
    console.log(`Общий размер: ${totalSize} символов (${Math.round(totalSize / 1024)} KB)`);
    console.log('=== 📊 ПРОВЕРКА ЗАВЕРШЕНА ===');
    
    return totalSize;
}

// Экспортируем все функции для отладки
window.debugSystem = debugSystem;
window.createTestApplication = createTestApplication;
window.repairAdminData = repairAdminData;
window.clearAllData = clearAllData;
window.checkStorage = checkStorage;
window.checkUserStatus = checkUserStatus;
window.getCurrentUser = getCurrentUser;
window.submitForModeration = submitForModeration;
window.getActiveUsers = getActiveUsers;

console.log("✅ Utils.js загружен успешно!");
console.log("ℹ️ Доступные команды для отладки:");
console.log("  - debugSystem() - показать все данные");
console.log("  - createTestApplication() - создать тестовую заявку");
console.log("  - repairAdminData() - восстановить данные");
console.log("  - clearAllData() - очистить все данные");
console.log("  - checkStorage() - проверить состояние localStorage");
