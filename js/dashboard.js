// ========== ЛОГИКА ДАШБОРДА SiaMatch ==========

let currentUser = null;
let availableUsers = [];
let currentUserIndex = 0;

// Инициализация дашборда
function initDashboard() {
    console.log('Инициализация дашборда');
    
    // Получаем текущего пользователя
    currentUser = getCurrentUser();
    if (!currentUser) {
        console.error('Пользователь не найден. Перенаправляем на регистрацию.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Текущий пользователь:', currentUser);
    
    // Обновляем аватар пользователя
    updateUserAvatar();
    
    // Загружаем анкеты для свайпов
    loadAvailableUsers();
    
    // Загружаем профиль пользователя
    loadUserProfile();
    
    // Загружаем чаты (демо данные)
    loadDemoChats();
    
    // Показываем первую анкету
    showNextProfile();
}

// Обновление аватара пользователя
function updateUserAvatar() {
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && currentUser && currentUser.name) {
        userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    }
}

// Загрузка доступных пользователей для свайпов
function loadAvailableUsers() {
    console.log('Загрузка доступных пользователей');
    
    // Получаем активных пользователей с противоположным полом
    availableUsers = getActiveUsers(currentUser.id);
    
    console.log('Доступно пользователей:', availableUsers.length);
    console.log('Пользователи:', availableUsers);
    
    if (availableUsers.length === 0) {
        showNoUsersMessage();
    }
}

// Показ сообщения "нет пользователей"
function showNoUsersMessage() {
    const swipeContainer = document.getElementById('tab-swipe');
    if (swipeContainer) {
        swipeContainer.innerHTML = `
            <div class="no-users-message">
                <div class="no-users-icon">👥</div>
                <h3>Пока никого нет рядом</h3>
                <p>Подождите немного, скоро появятся новые анкеты</p>
                <button class="btn" onclick="loadAvailableUsers()">Обновить</button>
            </div>
        `;
    }
}

// Показать следующую анкету
function showNextProfile() {
    console.log('Показ следующей анкеты, текущий индекс:', currentUserIndex);
    
    if (availableUsers.length === 0) {
        showNoUsersMessage();
        return;
    }
    
    if (currentUserIndex >= availableUsers.length) {
        currentUserIndex = 0; // Начинаем сначала
    }
    
    const user = availableUsers[currentUserIndex];
    console.log('Показываю пользователя:', user);
    
    // Обновляем DOM элементы
    updateProfileCard(user);
    
    // Увеличиваем индекс для следующей анкеты
    currentUserIndex++;
}

// Обновление карточки профиля
function updateProfileCard(user) {
    const profilePhoto = document.getElementById('profile-photo');
    const profileName = document.getElementById('profile-name');
    const profileCity = document.getElementById('profile-city');
    const profileBio = document.getElementById('profile-bio');
    
    if (profilePhoto) {
        if (user.photo) {
            profilePhoto.style.backgroundImage = `url('${user.photo}')`;
            profilePhoto.style.backgroundSize = 'cover';
            profilePhoto.style.backgroundPosition = 'center';
        } else {
            profilePhoto.textContent = user.name ? user.name.charAt(0).toUpperCase() : '?';
        }
    }
    
    if (profileName) {
        profileName.textContent = `${user.name}, ${user.age}`;
    }
    
    if (profileCity) {
        profileCity.textContent = `📍 ${user.city}`;
    }
    
    if (profileBio) {
        profileBio.textContent = user.bio || 'Пользователь SiaMatch';
    }
}

// Свайп вправо (лайк)
function swipeRight() {
    if (availableUsers.length === 0) return;
    
    const currentUserIndexToSave = currentUserIndex - 1;
    if (currentUserIndexToSave < 0 || currentUserIndexToSave >= availableUsers.length) return;
    
    const likedUser = availableUsers[currentUserIndexToSave];
    console.log('Лайкнули пользователя:', likedUser);
    
    // Добавляем в понравившиеся
    addToLiked(likedUser.id);
    
    // Проверяем взаимный лайк (мэтч)
    checkForMatch(likedUser.id);
    
    // Анимация свайпа вправо
    animateSwipe('right');
    
    // Показываем следующую анкету
    setTimeout(showNextProfile, 300);
}

// Свайп влево (дизлайк)
function swipeLeft() {
    if (availableUsers.length === 0) return;
    
    const currentUserIndexToSave = currentUserIndex - 1;
    if (currentUserIndexToSave < 0 || currentUserIndexToSave >= availableUsers.length) return;
    
    const dislikedUser = availableUsers[currentUserIndexToSave];
    console.log('Дизлайкнули пользователя:', dislikedUser);
    
    // Добавляем в непонравившиеся
    addToDisliked(dislikedUser.id);
    
    // Анимация свайпа влево
    animateSwipe('left');
    
    // Показываем следующую анкету
    setTimeout(showNextProfile, 300);
}

// Анимация свайпа
function animateSwipe(direction) {
    const profileCard = document.querySelector('.profile-card');
    if (!profileCard) return;
    
    profileCard.style.transition = 'transform 0.3s ease';
    profileCard.style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'}) rotate(${direction === 'right' ? '20deg' : '-20deg'})`;
    
    setTimeout(() => {
        profileCard.style.transition = 'none';
        profileCard.style.transform = 'translateX(0) rotate(0)';
    }, 300);
}

// Добавить в понравившиеся
function addToLiked(userId) {
    const likedUsers = JSON.parse(localStorage.getItem(`sia_liked_${currentUser.id}`) || '[]');
    
    if (!likedUsers.includes(userId)) {
        likedUsers.push(userId);
        localStorage.setItem(`sia_liked_${currentUser.id}`, JSON.stringify(likedUsers));
        
        // Обновляем счетчик лайков
        updateLikesCount(likedUsers.length);
        
        showNotification('❤️ Добавлено в понравившиеся', 'success');
    }
}

// Добавить в непонравившиеся
function addToDisliked(userId) {
    const dislikedUsers = JSON.parse(localStorage.getItem(`sia_disliked_${currentUser.id}`) || '[]');
    
    if (!dislikedUsers.includes(userId)) {
        dislikedUsers.push(userId);
        localStorage.setItem(`sia_disliked_${currentUser.id}`, JSON.stringify(dislikedUsers));
        
        showNotification('👎 Пропущено', 'info');
    }
}

// Проверка на взаимный лайк (мэтч)
function checkForMatch(userId) {
    // Проверяем, лайкнул ли этот пользователь нас
    const otherUserLiked = JSON.parse(localStorage.getItem(`sia_liked_${userId}`) || '[]');
    
    if (otherUserLiked.includes(currentUser.id)) {
        // ВЗАИМНЫЙ ЛАЙК! МЭТЧ!
        console.log('🎉 ВЗАИМНЫЙ ЛАЙК! Мэтч с пользователем ID:', userId);
        
        // Добавляем мэтч
        addMatch(currentUser.id, userId);
        
        // Показываем уведомление о мэтче
        const matchedUser = availableUsers.find(u => u.id === userId);
        if (matchedUser) {
            showNotification(`🎉 У вас взаимная симпатия с ${matchedUser.name}!`, 'success');
        }
    }
}

// Обновление счетчика лайков
function updateLikesCount(count) {
    const likesElement = document.getElementById('my-likes');
    if (likesElement) {
        likesElement.textContent = count;
    }
}

// Обновление счетчика мэтчей
function updateMatchesCount(count) {
    const matchesElement = document.getElementById('my-matches');
    if (matchesElement) {
        matchesElement.textContent = count;
    }
}

// Загрузка профиля пользователя
function loadUserProfile() {
    console.log('Загрузка профиля пользователя');
    
    const myName = document.getElementById('my-name');
    const myAgeCity = document.getElementById('my-age-city');
    const myProfilePhoto = document.getElementById('my-profile-photo');
    
    if (currentUser) {
        if (myName) {
            myName.textContent = currentUser.name || 'Не указано';
        }
        
        if (myAgeCity) {
            const age = currentUser.age ? `${currentUser.age} лет` : '';
            const city = currentUser.city || '';
            myAgeCity.textContent = `${age}${age && city ? ', ' : ''}${city}`;
        }
        
        if (myProfilePhoto) {
            if (currentUser.mainPhoto) {
                myProfilePhoto.style.backgroundImage = `url('${currentUser.mainPhoto}')`;
                myProfilePhoto.style.backgroundSize = 'cover';
                myProfilePhoto.style.backgroundPosition = 'center';
                myProfilePhoto.textContent = '';
            } else if (currentUser.name) {
                myProfilePhoto.textContent = currentUser.name.charAt(0).toUpperCase();
            }
        }
        
        // Загружаем статистику
        loadUserStats();
    }
}

// Загрузка статистики пользователя
function loadUserStats() {
    const likedUsers = JSON.parse(localStorage.getItem(`sia_liked_${currentUser.id}`) || '[]');
    const matches = JSON.parse(localStorage.getItem(`sia_matches_${currentUser.id}`) || '[]');
    
    updateLikesCount(likedUsers.length);
    updateMatchesCount(matches.length);
}

// Загрузка демо-чатов
function loadDemoChats() {
    // В реальном приложении здесь будет загрузка реальных чатов
    console.log('Загружаем демо-чаты');
    
    // Пример демо-чатов
    const demoChats = [
        {
            name: "Анна",
            avatar: "А",
            lastMessage: "Привет! Как дела?",
            time: "12:30",
            unread: true
        },
        {
            name: "Иван",
            avatar: "И",
            lastMessage: "Давай встретимся!",
            time: "11:45",
            unread: false
        }
    ];
    
    // Можно добавить логику отображения чатов
}

// Навигация по вкладкам
function showTab(tabName) {
    console.log('Переключение на вкладку:', tabName);
    
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const tabElement = document.getElementById(`tab-${tabName}`);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }
    
    // Активируем соответствующую кнопку
    const navButtons = document.querySelectorAll('.nav-btn');
    const buttonIndex = tabName === 'chats' ? 0 : tabName === 'swipe' ? 1 : 2;
    if (navButtons[buttonIndex]) {
        navButtons[buttonIndex].classList.add('active');
    }
    
    // Если переключились на свайпы, обновляем анкеты
    if (tabName === 'swipe') {
        loadAvailableUsers();
        showNextProfile();
    }
    
    // Если переключились на профиль, обновляем статистику
    if (tabName === 'profile') {
        loadUserStats();
    }
}

// Редактирование профиля
function editProfile() {
    if (confirm('Хотите отредактировать профиль? Вас перенаправит на страницу редактирования.')) {
        // В будущем можно сделать отдельную страницу редактирования
        // Пока просто показываем сообщение
        showNotification('Редактирование профиля скоро будет доступно', 'info');
    }
}

// Настройки
function showSettings() {
    if (confirm('Хотите перейти в настройки?')) {
        // В будущем можно сделать отдельную страницу настроек
        // Пока просто показываем сообщение
        showNotification('Настройки скоро будут доступны', 'info');
    }
}

// Выход
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        // Очищаем данные текущей сессии
        localStorage.removeItem('sia_current_user');
        localStorage.removeItem('sia_current_user_id');
        
        // Перенаправляем на главную
        window.location.href = 'index.html';
    }
}

// Показ уведомления (из utils.js, дублируем на всякий случай)
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Дашборд загружен');
    initDashboard();
});

console.log("✅ Dashboard.js загружен");
