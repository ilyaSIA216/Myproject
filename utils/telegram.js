// ===== UTILS/TELEGRAM.JS — TELEGRAM WEBAPP ИНТЕГРАЦИЯ =====

// ✅ ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ TELEGRAM
async function initTelegram() {
  try {
    if (window.Telegram && Telegram.WebApp) {
      window.tg = Telegram.WebApp;
      console.log('✅ Telegram WebApp обнаружен');
      
      // Базовая настройка
      window.tg.ready();
      window.tg.expand();
      
      // Скрываем MainButton (используем свои кнопки)
      if (window.tg.MainButton) {
        window.tg.MainButton.hide();
      }
      
      // iOS оптимизация
      if (isIOS()) {
        console.log('📱 iOS обнаружен — настраиваем клавиатуру');
        document.body.classList.add('no-bounce');
        setupKeyboardHandlers();
      }
      
      // Запрашиваем viewport для полного экрана
      setTimeout(() => {
        if (window.tg.requestViewport) {
          window.tg.requestViewport();
        }
      }, 500);
      
      // Telegram данные пользователя
      setupTelegramUserData();
      
      return true;
    } else {
      console.warn('⚠️ Telegram WebApp не найден — демо режим');
      return false;
    }
  } catch (e) {
    console.error('❌ Ошибка Telegram:', e);
    return false;
  }
}

// ✅ Проверка iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// ✅ НАСТРОЙКА КЛАВИАТУРЫ iOS (ТВОЯ ЛОГИКА)
let keyboardHeight = 0;
let originalHeight = window.innerHeight;

function setupKeyboardHandlers() {
  console.log('⌨️ Настраиваем обработчики клавиатуры iOS');
  
  originalHeight = window.innerHeight;
  
  window.addEventListener('resize', handleResize);
  document.addEventListener('focusin', handleFocusIn);
  document.addEventListener('focusout', handleFocusOut);
  document.addEventListener('touchstart', handleTouchOutside);
  
  // Удаляем лишние индикаторы фото (iOS баг)
  document.addEventListener('DOMContentLoaded', () => {
    const killer = setInterval(() => {
      document.querySelectorAll('.photo-swipe-indicator, [class*="indicator"], [class*="arrow"]').forEach(el => el.remove());
    }, 500);
    setTimeout(() => clearInterval(killer), 10000);
  });
}

// ✅ ОБРАБОТЧИКИ КЛАВИАТУРЫ (ТВОЯ ЛОГИКА)
function handleResize() {
  const newHeight = window.innerHeight;
  const heightDiff = originalHeight - newHeight;
  
  if (heightDiff > 100) {
    keyboardHeight = heightDiff;
    document.body.classList.add('keyboard-open');
    
    const card = document.getElementById('profileCard') || document.getElementById('card');
    if (card) {
      card.style.transform = `translateY(-${Math.min(150, keyboardHeight - 100)}px)`;
    }
    
    // Скролл к активному полю
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      setTimeout(() => {
        activeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
    }
  } else if (Math.abs(originalHeight - newHeight) < 50) {
    document.body.classList.remove('keyboard-open');
    
    const card = document.getElementById('profileCard') || document.getElementById('card');
    if (card) {
      card.style.transform = 'translateY(0)';
    }
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
    
    keyboardHeight = 0;
  }
  
  originalHeight = newHeight;
}

function handleFocusIn(e) {
  if (e.target.matches('input, textarea, select')) {
    if (isIOS()) {
      setTimeout(() => {
        document.body.classList.add('keyboard-open');
      }, 100);
    }
  }
}

function handleFocusOut(e) {
  if (e.target.matches('input, textarea, select')) {
    if (isIOS()) {
      setTimeout(() => {
        const activeElement = document.activeElement;
        if (!activeElement || !activeElement.matches('input, textarea, select')) {
          document.body.classList.remove('keyboard-open');
          const card = document.getElementById('profileCard') || document.getElementById('card');
          if (card) card.style.transform = 'translateY(0)';
        }
      }, 500);
    }
  }
}

function handleTouchOutside(e) {
  if (!e.target.closest('input, textarea, select, button')) {
    document.activeElement?.blur();
  }
}

// ✅ TELEGRAM USER DATA
function setupTelegramUserData() {
  if (!window.tg?.initDataUnsafe?.user) return;
  
  const user = window.tg.initDataUnsafe.user;
  console.log('👤 Telegram пользователь:', user);
  
  // Глобальные данные
  window.tgUser = {
    id: user.id,
    first_name: user.first_name || 'Пользователь',
    last_name: user.last_name || '',
    username: user.username || '',
    language_code: user.language_code || 'ru',
    is_premium: user.is_premium || false,
    photo_url: user.photo_url || ''
  };
  
  // Обновляем имя в хедере
  const profileNameEl = document.getElementById('profileName');
  if (profileNameEl) {
    profileNameEl.textContent = window.tgUser.first_name;
  }
}

// ✅ HAPTIC FEEDBACK (Вибрация)
function hapticFeedback(type = 'light') {
  if (window.tg?.HapticFeedback) {
    try {
      switch(type) {
        case 'light': window.tg.HapticFeedback.selectionChanged(); break;
        case 'medium': window.tg.HapticFeedback.impactOccurred('medium'); break;
        case 'heavy': window.tg.HapticFeedback.impactOccurred('heavy'); break;
        case 'success': window.tg.HapticFeedback.notificationOccurred('success'); break;
        case 'error': window.tg.HapticFeedback.notificationOccurred('error'); break;
      }
    } catch(e) {
      console.warn('Haptic feedback не поддерживается');
    }
  } else if (navigator.vibrate) {
    // Fallback для браузера
    navigator.vibrate(50);
  }
}

// ✅ SHARE FUNCTIONS
function shareProfile() {
  const text = `❤️ Присоединяйся к SiaMatch! 
Лучшее приложение для знакомств в Telegram!
t.me/siamatch_bot`;
  
  if (window.tg?.shareUrl) {
    window.tg.shareUrl({
      url: window.tg.initDataUnsafe.start_param || 't.me/siamatch_bot',
      text: text
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('✅ Ссылка скопирована!');
    });
  }
}

function showShareStories() {
  handleShareStories(); // Твоя функция из logic.js
}

// ✅ BACK BUTTON
function setupBackButton(callback) {
  if (window.tg?.BackButton) {
    window.tg.BackButton.show();
    window.tg.BackButton.onClick(callback || (() => {
      if (document.querySelector('.screen.active') !== document.getElementById('screen-feed')) {
        setActiveTab('feed');
      } else {
        window.tg.close();
      }
    }));
  }
}

// ✅ THEME FUNCTIONS
function setTheme(theme = 'light') {
  if (window.tg?.setHeaderColor) {
    window.tg.setHeaderColor(theme === 'dark' ? '#1a1a1a' : '#ffffff');
  }
  
  document.body.setAttribute('data-theme', theme);
}

// ✅ DEBUG MODE
window.telegramDebug = false;
function toggleDebug() {
  window.telegramDebug = !window.telegramDebug;
  console.log('🔧 Debug mode:', window.telegramDebug ? 'ON' : 'OFF');
  
  if (window.telegramDebug) {
    console.log('📱 TG Data:', window.tgUser);
    console.log('💾 Profile:', window.profileData?.current);
  }
}

// ✅ EXPORTS (для app.js)
window.TelegramUtils = {
  init: initTelegram,
  haptic: hapticFeedback,
  share: shareProfile,
  backButton: setupBackButton,
  setTheme: setTheme,
  isIOS: isIOS,
  user: () => window.tgUser
};

// Автоинициализация при загрузке
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTelegram);
} else {
  initTelegram();
}
