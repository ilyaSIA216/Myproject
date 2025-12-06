// ========== УТИЛИТЫ ДЛЯ SiaMatch ==========

// Мок Telegram WebApp для разработки
window.Telegram = {
    WebApp: {
        initData: '',
        initDataUnsafe: {
            user: {
                id: Math.floor(Math.random() * 1000000),
                first_name: 'Тестовый',
                last_name: 'Пользователь',
                username: 'test_user',
                language_code: 'ru'
            },
            query_id: 'test_query_id',
            auth_date: Date.now() / 1000,
            hash: 'test_hash'
        },
        ready: function() {
            console.log('Telegram WebApp ready');
        },
        expand: function() {
            console.log('WebApp expanded');
        },
        close: function() {
            console.log('Closing WebApp');
        },
        showAlert: function(message, callback) {
            alert(message);
            if (callback) callback();
        },
        showConfirm: function(message, callback) {
            const result = confirm(message);
            if (callback) callback(result);
        },
        sendData: function(data) {
            console.log('Sending data to bot:', data);
        }
    }
};

// Инициализация Telegram WebApp
if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

// ========== УТИЛИТЫ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ==========

// Получение текущего пользователя
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sia_current_user')) || null;
}

// Сохранение пользователя
function saveUser(userData) {
    localStorage.setItem('sia_current_user', JSON.stringify(userData));
    return userData;
}

// Получение всех пользователей (для демо)
function getAllUsers() {
    return JSON.parse(localStorage.getItem('sia_users')) || [];
}

// Сохранение всех пользователей
function saveAllUsers(users) {
    localStorage.setItem('sia_users', JSON.stringify(users));
}

// ========== УТИЛИТЫ ДЛЯ НАВИГАЦИИ ==========

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
    
    // Добавляем стили для анимации
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
    "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск",
    "Барнаул", "Ульяновск", "Иркутск", "Хабаровск", "Ярославль",
    "Владивосток", "Махачкала", "Томск", "Оренбург", "Кемерово",
    "Новокузнецк", "Рязань", "Астрахань", "Набережные Челны", "Пенза",
    "Липецк", "Киров", "Чебоксары", "Тула", "Калининград",
    "Балашиха", "Курск", "Севастополь", "Сочи", "Ставрополь",
    "Улан-Удэ", "Тверь", "Магнитогорск", "Иваново", "Брянск",
    "Белгород", "Сургут", "Владимир", "Нижний Тагил", "Архангельск",
    "Чита", "Симферополь", "Калуга", "Смоленск", "Волжский",
    "Саранск", "Череповец", "Курган", "Орёл", "Вологда",
    "Якутск", "Подольск", "Мурманск", "Грозный", "Тамбов",
    "Стерлитамак", "Петрозаводск", "Кострома", "Нижневартовск", "Новороссийск",
    "Йошкар-Ола", "Химки", "Таганрог", "Сыктывкар", "Нальчик",
    "Шахты", "Братск", "Дзержинск", "Орск", "Ангарск",
    "Благовещенск", "Энгельс", "Старый Оскол", "Великий Новгород", "Королёв",
    "Псков", "Мытищи", "Бийск", "Люберцы", "Южно-Сахалинск",
    "Армавир", "Балаково", "Рыбинск", "Абакан", "Северодвинск",
    "Петропавловск-Камчатский", "Норильск", "Сызрань", "Волгодонск", "Златоуст",
    "Каменск-Уральский", "Электросталь", "Новочеркасск", "Салават", "Миасс",
    "Находка", "Керчь", "Копейск", "Хасавюрт", "Уссурийск"
].sort();

// ========== АВТОПРОВЕРКА АВТОРИЗАЦИИ ==========

function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    
    // Если на dashboard.html, но нет пользователя
    if (currentPath.includes('dashboard.html') && !currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    // Если на index.html, но пользователь уже есть и одобрен
    if (currentPath.includes('index.html') && currentUser) {
        const status = checkUserStatus(currentUser.id);
        if (status === 'approved') {
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    return true;
}

// Автопроверка при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuth);

// ========== СИСТЕМА МОДЕРАЦИИ ==========

// Отправка заявки на модерацию
function submitForModeration(userData) {
    console.log('submitForModeration вызвана с данными:', userData);
    
    const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');

    // НЕ трогаем id, если он уже есть (приходит из auth.js)
    if (!userData.id) {
        userData.id = Date.now();
        console.log('Создан новый ID для пользователя:', userData.id);
    }

    userData.status = 'pending';
    userData.submittedAt = new Date().toISOString();
    userData.applicationId = 'APP-' + userData.id.toString().slice(-6);

    console.log('Добавляю пользователя в pendingUsers:', userData);
    
    pendingUsers.push(userData);
    localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));

    console.log('Теперь всего заявок:', pendingUsers.length);

    // Создаем уведомление для админа
    notifyAdmin(userData);

    console.log(`📝 Заявка #${userData.applicationId} отправлена на модерацию: ${userData.name}`);

    // возвращаем именно userId
    return userData.id;
}

// Уведомление админа
function notifyAdmin(userData) {
    const adminNotifications = JSON.parse(localStorage.getItem('sia_admin_notifications') || '[]');
    
    adminNotifications.push({
        id: Date.now(),
        userId: userData.id,
        applicationId: userData.applicationId,
        name: userData.name,
        gender: userData.gender,
        age: userData.age,
        city: userData.city,
        time: new Date().toLocaleString(),
        type: 'new_application',
        read: false
    });
    
    localStorage.setItem('sia_admin_notifications', JSON.stringify(adminNotifications.slice(-100)));
    
    // В реальном приложении здесь будет отправка на сервер/email/telegram
    console.log(`📨 Новое уведомление для админа: ${userData.name} (${userData.gender})`);
}

// Проверка статуса пользователя
function checkUserStatus(userId) {
    const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
    const user = pendingUsers.find(u => u.id === userId);
    
    if (!user) {
        // Проверяем, может пользователь уже в активных
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        const activeUser = activeUsers.find(u => u.id === userId);
        return activeUser ? 'approved' : 'not_found';
    }
    
    // Если пользователь одобрен, но еще не в активных - добавляем
    if (user.status === 'approved') {
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        const activeUser = activeUsers.find(u => u.id === userId);
        
        if (!activeUser) {
            activeUsers.push({
                id: user.id,
                name: user.name,
                age: user.age,
                city: user.city,
                photo: user.mainPhoto,
                bio: user.bio || 'Пользователь SiaMatch',
                gender: user.gender || 'Не указан'
            });
            localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
        }
    }
    
    return user.status;
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
            reason: 'Ваша анкета находится на проверке у администратора', 
            code: 'pending',
            details: 'Обычно проверка занимает от нескольких минут до 24 часов'
        };
    } else if (status === 'rejected') {
        // Получаем причину отклонения
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const user = pendingUsers.find(u => u.id === currentUser.id);
        const reason = user && user.rejectionReason ? `Причина: ${user.rejectionReason}` : 'Пожалуйста, проверьте данные';
        
        return { 
            allowed: false, 
            reason: 'Ваша анкета не прошла модерацию', 
            code: 'rejected',
            details: reason
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
            code: 'unknown',
            details: 'Пожалуйста, обратитесь в поддержку'
        };
    }
}

// Получение активных пользователей для свайпов (с учетом пола)
function getActiveUsers(currentUserId) {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.gender) {
        console.log('Текущий пользователь или его пол не определен');
        return createDemoUsers(currentUserId);
    }
    
    const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    
    // Если нет активных пользователей, создаем демо
    if (activeUsers.length === 0) {
        return createDemoUsers(currentUserId);
    }
    
    // Фильтруем текущего пользователя и выбираем противоположный пол
    return activeUsers.filter(user => {
        return user.id !== currentUserId && 
               ((currentUser.gender === 'male' && user.gender === 'female') ||
                (currentUser.gender === 'female' && user.gender === 'male'));
    });
}

// Создание демо-пользователей для свайпов
function createDemoUsers(currentUserId) {
    const demoUsers = [
        {
            id: 100001,
            name: "Анна",
            age: 25,
            city: "Москва",
            gender: "female",
            photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop",
            bio: "Люблю путешествия и книги. Ищу серьёзные отношения.",
            interests: ["Путешествия", "Книги", "Йога", "Кофе"]
        },
        {
            id: 100002,
            name: "Мария",
            age: 28,
            city: "Санкт-Петербург",
            gender: "female",
            photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop",
            bio: "Фотограф по профессии, мечтатель по призванию.",
            interests: ["Фотография", "Искусство", "Виноделие", "Велоспорт"]
        },
        {
            id: 100003,
            name: "Иван",
            age: 30,
            city: "Казань",
            gender: "male",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
            bio: "Программист, люблю горы и технологии.",
            interests: ["Программирование", "Горы", "Технологии", "Спорт"]
        },
        {
            id: 100004,
            name: "Алексей",
            age: 32,
            city: "Екатеринбург",
            gender: "male",
            photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
            bio: "Бизнесмен. Ценю умных и целеустремлённых людей.",
            interests: ["Бизнес", "Психология", "Авто", "Путешествия"]
        },
        {
            id: 100005,
            name: "Екатерина",
            age: 23,
            city: "Новосибирск",
            gender: "female",
            photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
            bio: "Студентка, увлекаюсь танцами и искусством.",
            interests: ["Танцы", "Искусство", "Настолки", "Горы"]
        }
    ];
    
    // Сохраняем демо-пользователей
    localStorage.setItem('sia_active_users', JSON.stringify(demoUsers));
    
    // Фильтруем по противоположному полу текущего пользователя
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.gender) {
        return demoUsers.filter(user => 
            user.id !== currentUserId && 
            ((currentUser.gender === 'male' && user.gender === 'female') ||
             (currentUser.gender === 'female' && user.gender === 'male'))
        );
    }
    
    // Если пол не определен, показываем всех
    return demoUsers.filter(user => user.id !== currentUserId);
}

// Получение уведомлений пользователя
function getUserNotifications(userId) {
    return JSON.parse(localStorage.getItem(`sia_notifications_${userId}`) || '[]');
}

// Добавление уведомления для пользователя
function addUserNotification(userId, type, message) {
    const notifications = JSON.parse(localStorage.getItem(`sia_notifications_${userId}`) || '[]');
    
    notifications.push({
        id: Date.now(),
        type: type,
        message: message,
        time: new Date().toISOString(),
        read: false
    });
    
    localStorage.setItem(`sia_notifications_${userId}`, JSON.stringify(notifications));
    
    // Обновляем счетчик непрочитанных
    updateUnreadCount(userId);
}

// Обновление счетчика непрочитанных уведомлений
function updateUnreadCount(userId) {
    const notifications = JSON.parse(localStorage.getItem(`sia_notifications_${userId}`) || '[]');
    const unreadCount = notifications.filter(n => !n.read).length;
    localStorage.setItem(`sia_unread_count_${userId}`, unreadCount.toString());
}

// Добавление совпадения (match)
function addMatch(userId, matchedUserId) {
    const matches = JSON.parse(localStorage.getItem(`sia_matches_${userId}`) || '[]');
    
    if (!matches.some(match => match.userId === matchedUserId)) {
        matches.push({
            userId: matchedUserId,
            matchedAt: new Date().toISOString(),
            unread: true
        });
        
        localStorage.setItem(`sia_matches_${userId}`, JSON.stringify(matches));
        
        // Добавляем уведомление
        const matchedUser = getActiveUsers().find(u => u.id === matchedUserId);
        if (matchedUser) {
            addUserNotification(userId, 'match', `У вас новое совпадение с ${matchedUser.name}!`);
        }
    }
}

// ========== ДЕМО-ДАННЫЕ ДЛЯ ТЕСТИРОВАНИЯ ==========

// Функция для создания тестовых заявок
function createDemoApplications() {
    const demoUsers = [
        {
            id: Date.now() - 1000,
            applicationId: 'APP-' + (Date.now() - 1000).toString().slice(-6),
            name: "Анна",
            gender: "female",
            age: 25,
            city: "Москва",
            mainPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop",
            selfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
            status: "pending",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            bio: "Люблю путешествия и книги. Ищу серьёзные отношения."
        },
        {
            id: Date.now() - 2000,
            applicationId: 'APP-' + (Date.now() - 2000).toString().slice(-6),
            name: "Иван",
            gender: "male",
            age: 30,
            city: "Санкт-Петербург",
            mainPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
            selfie: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
            status: "approved",
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            moderatedAt: new Date(Date.now() - 3600000).toISOString(),
            moderator: "Администратор",
            bio: "Программист, люблю горы и технологии."
        },
        {
            id: Date.now() - 3000,
            applicationId: 'APP-' + (Date.now() - 3000).toString().slice(-6),
            name: "Мария",
            gender: "female",
            age: 22,
            city: "Казань",
            mainPhoto: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop",
            selfie: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
            status: "rejected",
            submittedAt: new Date(Date.now() - 10800000).toISOString(),
            moderatedAt: new Date(Date.now() - 9000000).toISOString(),
            moderator: "Администратор",
            rejectionReason: "Некорректное селфи для подтверждения личности",
            bio: "Студентка, увлекаюсь танцами и искусством."
        }
    ];
    
    localStorage.setItem('sia_pending_users', JSON.stringify(demoUsers));
    console.log("✅ Демо-заявки созданы");
    
    // Добавляем одобренных в активные пользователи
    const approvedUser = demoUsers.find(u => u.status === 'approved');
    if (approvedUser) {
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        if (!activeUsers.some(u => u.id === approvedUser.id)) {
            activeUsers.push({
                id: approvedUser.id,
                name: approvedUser.name,
                age: approvedUser.age,
                city: approvedUser.city,
                photo: approvedUser.mainPhoto,
                bio: approvedUser.bio,
                gender: approvedUser.gender
            });
            localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
        }
    }
}

// Функция для создания демо-логов
function createDemoLogs() {
    const demoLogs = [
        {
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            success: true,
            ip: "192.168.1.1",
            attemptedPassword: "***",
            userAgent: "Chrome/Windows"
        },
        {
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            success: false,
            ip: "192.168.1.2",
            attemptedPassword: "wrong***",
            userAgent: "Firefox/Mac"
        },
        {
            timestamp: new Date(Date.now() - 21600000).toISOString(),
            success: true,
            ip: "192.168.1.1",
            attemptedPassword: "***",
            userAgent: "Chrome/Windows"
        }
    ];
    
    localStorage.setItem('sia_admin_log', JSON.stringify(demoLogs));
    console.log("✅ Демо-логи созданы");
}

// Функция для сброса всех данных (для тестирования)
function resetAllData() {
    if (confirm('Вы уверены? Все данные будут удалены.')) {
        localStorage.clear();
        showNotification('Все данные сброшены', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

console.log("✅ Utils.js загружен");
