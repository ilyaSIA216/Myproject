// ===== SIAMATCH MAIN APP — TINDER UI 2025 =====
class SiaMatchApp {
  constructor() {
    this.init();
  }

  async init() {
    console.log('🚀 SiaMatch инициализация...');
    
    // Telegram WebApp
    await initTelegram();
    
    // Загружаем данные
    await this.loadUserData();
    
    // Показываем основной интерфейс
    this.showMainApp();
    
    // Инициализируем все системы
    initAllSystems();
    
    // Слушатели событий
    this.bindEvents();
    
    console.log('✅ SiaMatch полностью готов!');
  }

  async loadUserData() {
    // Загружаем профиль пользователя
    window.profileData = window.profileData || {};
    window.profileData.current = loadProfile();
    
    // Telegram данные
    if (window.tg?.initDataUnsafe?.user) {
      const user = window.tg.initDataUnsafe.user;
      document.getElementById('profileName').textContent = user.first_name || 'Пользователь';
      
      if (!window.profileData.current) {
        window.profileData.current = {
          tg_id: user.id,
          first_name: user.first_name || 'Пользователь',
          username: user.username || '',
          photos: []
        };
      }
    }
  }

  showMainApp() {
    // Скрываем загрузку
    const loadingScreen = document.querySelector('.loading-screen');
    loadingScreen.classList.remove('active');
    
    // Показываем основной контент
    document.querySelector('.main-content').style.display = 'block';
    
    // Показываем экран в зависимости от профиля
    if (!window.profileData.current?.age) {
      this.showProfileSetup();
    } else {
      setActiveTab('feed');
      showCurrentCandidate();
    }
  }

  showProfileSetup() {
    // Если нет профиля — показываем создание
    document.getElementById('screen-profile').classList.add('active');
    setActiveTab('profile');
  }

  bindEvents() {
    // Табы навигации
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        setActiveTab(tab);
      });
    });

    // Кнопки свайпов
    document.getElementById('dislikeBtn').addEventListener('click', handleDislike);
    document.getElementById('likeBtn').addEventListener('click', handleLike);

    // Бейдж лайков
    document.getElementById('likesBadge').addEventListener('click', handleLikesBadgeClick);

    // Меню и настройки
    document.getElementById('menuBtn').addEventListener('click', () => {
      showNotification('📱 Меню в разработке...');
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      setActiveTab('profile');
      showNotification('⚙️ Настройки в профиле');
    });
  }
}

// ===== НАВИГАЦИЯ МЕЖДУ ТАБАМИ =====
function setActiveTab(tabName) {
  // Скрываем все экраны
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Убираем активный таб
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Показываем нужный экран
  document.getElementById(`screen-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Инициализируем контент таба
  switch(tabName) {
    case 'feed':
      initFeed();
      break;
    case 'profile':
      initProfile();
      break;
    case 'chats':
      initChatsTab();
      break;
  }
  
  if (window.tg?.HapticFeedback) {
    window.tg.HapticFeedback.selectionChanged();
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ЧАТОВ =====
function initChatsTab() {
  const screenChats = document.getElementById('screen-chats');
  if (screenChats.children.length === 0) {
    screenChats.innerHTML = `
      <div class="chats-container">
        <div id="chats-list" class="chats-list"></div>
        <div id="chats-empty" class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">Нет мэтчей</div>
          <div class="empty-subtitle">Свайпайте в ленте, чтобы найти интересных людей!</div>
        </div>
      </div>
    `;
    updateChatsList();
  }
}

// ===== УПРАВЛЕНИЕ КАРТОЧКАМИ =====
let currentIndex = 0;

function showCurrentCandidate() {
  if (currentIndex >= candidates.length) {
    // Нет больше кандидатов
    document.getElementById('profileCard').innerHTML = `
      <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 40px; text-align: center; color: #666;">
        <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
        <div style="font-size: 24px; font-weight: 700; color: #333; margin-bottom: 12px;">Анкеты закончились!</div>
        <div style="font-size: 16px; margin-bottom: 24px;">Вернитесь завтра за новыми мэтчами</div>
        <button onclick="currentIndex = 0; showCurrentCandidate()" style="padding: 12px 32px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer;">🔄 Обновить</button>
      </div>
    `;
    return;
  }

  const candidate = candidates[currentIndex];
  currentCandidateId = candidate.id;
  
  // Фото кандидата
  candidatePhotos = candidate.photos || [];
  currentPhotoIndex = 0;
  candidateInterests = candidate.interests || [];
  
  document.getElementById('profileCard').innerHTML = `
    <div class="candidate-photos-container">
      <img id="candidate-photo" src="${candidatePhotos[0] || ''}" alt="Фото">
      <div class="photo-overlay"></div>
    </div>
    
    <div class="candidate-info">
      <div class="candidate-name">${candidate.name}, ${candidate.age}</div>
      <div class="candidate-age-city">${candidate.city}</div>
      
      ${candidate.verified ? '<div class="verification-badge">✅ Верифицировано</div>' : ''}
      
      <div class="candidate-bio">${candidate.bio}</div>
      
      <div id="candidate-interests" class="candidate-interests"></div>
    </div>
  `;
  
  // Обновляем интересы и фото
  updateCandidateInterests();
  updateCandidatePhoto();
  
  // Пагинация фото
  const photosContainer = document.querySelector('.candidate-photos-container');
  if (candidatePhotos.length > 1) {
    createPhotoDots(photosContainer, candidatePhotos.length);
  }
  
  // Инициализируем свайпы
  initSwipeSystem();
}

// ===== ОБРАБОТЧИКИ СВАЙПОВ =====
function handleLike() {
  if (!useSwipe()) return;
  
  showSwipeAnimation('right');
  likedIds.push(currentCandidateId);
  
  setTimeout(() => {
    currentIndex++;
    showCurrentCandidate();
    
    // Шанс на мэтч 30%
    if (Math.random() < 0.3) {
      showMatchAnimation();
    }
    
    updateLikesUI();
  }, 400);
  
  if (window.tg?.HapticFeedback) {
    window.tg.HapticFeedback.impactOccurred('heavy');
  }
}

function handleDislike() {
  if (!useSwipe()) return;
  
  showSwipeAnimation('left');
  
  setTimeout(() => {
    currentIndex++;
    showCurrentCandidate();
  }, 400);
  
  if (window.tg?.HapticFeedback) {
    window.tg.HapticFeedback.impactOccurred('light');
  }
}

// ===== АНИМАЦИИ =====
function showMatchAnimation() {
  const matchModal = document.createElement('div');
  matchModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  matchModal.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      padding: 60px 40px;
      border-radius: 30px;
      text-align: center;
      color: white;
      max-width: 90%;
      animation: matchPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    ">
      <div style="font-size: 64px; margin-bottom: 20px;">💝</div>
      <div style="font-size: 28px; font-weight: 800; margin-bottom: 12px;">Это мэтч!</div>
      <div style="font-size: 18px; opacity: 0.9; margin-bottom: 30px;">Теперь можно начать общение</div>
      <button onclick="this.parentElement.parentElement.remove(); setActiveTab('chats');" 
              style="padding: 16px 40px; background: white; color: #ff6b6b; border: none; border-radius: 25px; font-size: 18px; font-weight: 700; cursor: pointer;">
        Перейти в чаты
      </button>
    </div>
  `;
  
  document.body.appendChild(matchModal);
}

function showNotification(text) {
  // Удаляем старые уведомления
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = text;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.9);
    color: white;
    padding: 16px 24px;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 500;
    max-width: 90%;
    text-align: center;
    line-height: 1.4;
    z-index: 10000;
    animation: slideDown 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// ===== СТИЛИ ДЛЯ УВЕДОМЛЕНИЙ =====
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
  @keyframes matchPop {
    0% { transform: scale(0.3) rotate(-180deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(0deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); }
  }
`;
document.head.appendChild(style);

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', () => {
  new SiaMatchApp();
});

// Глобальные обработчики клавиатуры iOS
window.handleResize = handleResize;
window.handleFocusIn = handleFocusIn;
window.handleFocusOut = handleFocusOut;
