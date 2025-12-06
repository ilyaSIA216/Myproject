// ========== ОБЩИЕ УТИЛИТЫ ДЛЯ ВСЕХ СТРАНИЦ ==========

// 1. Мок Telegram WebApp для разработки
if (!window.Telegram || !Telegram.WebApp) {
    console.log('🔧 Режим разработки: Имитируем Telegram WebApp');
    
    const mockUsers = [
        { first_name: 'Анна', id: 123456789, username: 'anna_user' },
        { first_name: 'Иван', id: 987654321, username: 'ivan_user' },
        { first_name: 'Мария', id: 456789123, username: 'maria_user' },
        { first_name: 'Алексей', id: 321654987, username: 'alex_user' }
    ];
    
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    window.Telegram = {
        WebApp: {
            initDataUnsafe: { user: randomUser },
            expand: () => console.log('[DEBUG] Telegram expanded'),
            ready: () => console.log('[DEBUG] Telegram ready'),
            showAlert: (msg) => {
                console.log('[DEBUG] Alert:', msg);
                alert(msg);
            },
            showConfirm: (msg, callback) => {
                console.log('[DEBUG] Confirm:', msg);
                if (confirm(msg)) callback(true);
                else callback(false);
            },
            openLink: (url) => {
                console.log('[DEBUG] Opening link:', url);
                window.open(url, '_blank');
            }
        }
    };
}

window.tg = window.Telegram.WebApp;

// 2. Утилиты для работы с пользователями
const UserUtils = {
    // Получить текущего пользователя
    getCurrentUser: () => {
        try {
            const saved = localStorage.getItem('sia_user');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            return null;
        }
    },
    
    // Сохранить пользователя
    saveUser: (userData) => {
        try {
            localStorage.setItem('sia_user', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения пользователя:', error);
            return false;
        }
    },
    
    // Получить всех пользователей
    getAllUsers: () => {
        try {
            const saved = localStorage.getItem('sia_all_users');
            const users = saved ? JSON.parse(saved) : [];
            
            // Создаем тестовых пользователей если список пустой
            if (users.length === 0) {
                return this.createDemoUsers();
            }
            
            return users;
        } catch (error) {
            console.error('Ошибка загрузки всех пользователей:', error);
            return [];
        }
    },
    
    // Сохранить всех пользователей
    saveAllUsers: (users) => {
        try {
            localStorage.setItem('sia_all_users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения всех пользователей:', error);
            return false;
        }
    },
    
    // Создать тестовых пользователей
    createDemoUsers: () => {
        const demoUsers = [
            {
                id: 1,
                telegramId: 111111111,
                firstName: 'Анна',
                age: 24,
                city: 'Москва',
                status: 'approved',
                mainPhoto: '',
                likes: 45,
                matches: 12,
                createdAt: '2024-01-15T10:30:00Z'
            },
            {
                id: 2,
                telegramId: 222222222,
                firstName: 'Иван',
                age: 28,
                city: 'Санкт-Петербург',
                status: 'approved',
                mainPhoto: '',
                likes: 32,
                matches: 8,
                createdAt: '2024-01-16T14:20:00Z'
            },
            {
                id: 3,
                telegramId: 333333333,
                firstName: 'Мария',
                age: 22,
                city: 'Казань',
                status: 'approved',
                mainPhoto: '',
                likes: 28,
                matches: 5,
                createdAt: '2024-01-17T09:15:00Z'
            }
        ];
        
        this.saveAllUsers(demoUsers);
        return demoUsers;
    },
    
    // Обновить статистику пользователя
    updateUserStats: (userId, stats) => {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.telegramId === userId);
        
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...stats };
            this.saveAllUsers(users);
            
            // Обновляем текущего пользователя если это он
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.telegramId === userId) {
                this.saveUser({ ...currentUser, ...stats });
            }
            
            return true;
        }
        
        return false;
    }
};

// 3. Утилиты навигации
const NavigationUtils = {
    goToPage: (page) => {
        window.location.href = page;
    },
    
    goToStep: (stepNumber) => {
        for (let i = 0; i <= 7; i++) {
            const element = document.getElementById(`step-${i}`);
            if (element) element.classList.add('hidden');
        }
        
        const target = document.getElementById(`step-${stepNumber}`);
        if (target) target.classList.remove('hidden');
    }
};

// 4. Утилиты уведомлений
const NotificationUtils = {
    show: (text, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = text;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideDown 0.3s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                to { transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease-out reverse forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
};

// Экспортируем утилиты
window.UserUtils = UserUtils;
window.NavigationUtils = NavigationUtils;
window.NotificationUtils = NotificationUtils;

// Список городов России
window.russianCities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Нижний Новгород",
    "Казань", "Челябинск", "Омск", "Самара", "Ростов-на-Дону", "Уфа", "Красноярск",
    "Воронеж", "Пермь", "Волгоград", "Краснодар", "Саратов", "Тюмень", "Тольятти",
    "Ижевск", "Барнаул", "Ульяновск", "Иркутск", "Хабаровск", "Ярославль",
    "Владивосток", "Махачкала", "Томск", "Оренбург", "Кемерово"
].sort((a, b) => a.localeCompare(b, 'ru'));

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Если это dashboard.html - проверяем авторизацию
    if (currentPage === 'dashboard.html') {
        const user = UserUtils.getCurrentUser();
        
        if (!user || user.status !== 'approved') {
            // Пользователь не одобрен - редирект на регистрацию
            NavigationUtils.goToPage('index.html');
        }
    }
    
    // Если это index.html - проверяем, может быть пользователь уже одобрен
    if (currentPage === 'index.html') {
        const user = UserUtils.getCurrentUser();
        
        if (user && user.status === 'approved') {
            // Пользователь уже одобрен - редирект на дашборд
            NavigationUtils.goToPage('dashboard.html');
        }
    }
});
