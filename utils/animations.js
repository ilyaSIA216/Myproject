// ===== UTILS/ANIMATIONS.JS — TINDER 2025 АНИМАЦИИ =====

// ✅ ГЛОБАЛЬНЫЕ АНИМАЦИИ
const animations = {
  matchPop: 'matchPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  cardFly: 'cardFly 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  pulse: 'pulse 2s infinite',
  shimmer: 'shimmer 2s infinite linear'
};

// ✅ ИНИЦИАЛИЗАЦИЯ АНИМАЦИЙ
function initAnimations() {
  injectAnimationsCSS();
  console.log('✨ Анимации Tinder загружены');
}

// ✅ ОСНОВНЫЕ CSS АНИМАЦИИ
function injectAnimationsCSS() {
  const style = document.createElement('style');
  style.id = 'tinder-animations';
  style.textContent = `
    /* 🔥 TINDER CARD FLY ANIMATION */
    @keyframes cardFly {
      0% { 
        transform: translateX(0) rotate(0deg) scale(1); 
        opacity: 1; 
      }
      30% { 
        transform: translateX(var(--dir-x, 500px)) rotate(var(--dir-rot, 15deg)) scale(0.95); 
      }
      100% { 
        transform: translateX(var(--dir-x, 500px)) translateY(-100px) rotate(var(--dir-rot, 15deg)) scale(0.8); 
        opacity: 0; 
      }
    }

    /* 💝 MATCH POPUP */
    @keyframes matchPop {
      0% { 
        transform: scale(0.3) rotate(-180deg); 
        opacity: 0; 
      }
      50% { 
        transform: scale(1.1) rotate(5deg); 
        opacity: 1; 
      }
      70% { 
        transform: scale(0.95) rotate(-5deg); 
      }
      100% { 
        transform: scale(1) rotate(0deg); 
      }
    }

    /* ❤️ HEART EXPLOSION */
    @keyframes heartExplosion {
      0% { 
        transform: scale(0) rotate(0deg) translateY(0); 
        opacity: 1; 
      }
      30% { 
        transform: scale(1.2) rotate(20deg) translateY(-20px); 
      }
      100% { 
        transform: scale(0) rotate(180deg) translateY(-100px); 
        opacity: 0; 
      }
    }

    @keyframes heartBeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }

    /* ✨ BOUNCE */
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-15px); }
      60% { transform: translateY(-7px); }
    }

    /* ⚡ PULSE */
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }

    /* 🌈 SHIMMER */
    @keyframes shimmer {
      0% { background-position: -500px 0; }
      100% { background-position: 500px 0; }
    }

    /* 🎯 BUTTON PRESS */
    @keyframes buttonPress {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }

    /* 🌀 CARD SWIPE */
    .profile-card.swiping {
      transition: none !important;
    }

    .profile-card.swipe-left {
      animation: cardFly 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      --dir-x: -600px;
      --dir-rot: -15deg;
    }

    .profile-card.swipe-right {
      animation: cardFly 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      --dir-x: 600px;
      --dir-rot: 15deg;
    }

    /* 💖 MATCH HEARTS */
    .match-hearts {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
    }

    .heart {
      position: absolute;
      font-size: 24px;
      color: #ff6b6b;
      animation: heartExplosion 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      text-shadow: 0 0 10px currentColor;
    }

    /* ✨ BUTTON ANIMATIONS */
    .swipe-btn:active {
      animation: buttonPress 0.15s ease;
      transform: scale(0.95) !important;
    }

    .like-btn:active {
      background: linear-gradient(135deg, #059669, #047857) !important;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.6) !important;
    }

    /* 🌟 LIKES BADGE PULSE */
    .likes-badge.new-likes {
      animation: pulse 1s infinite;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
    }

    /* 🎵 NOTIFICATION SLIDE */
    @keyframes notificationSlide {
      0% { 
        transform: translate(-50%, -100%) scale(0.8); 
        opacity: 0; 
      }
      100% { 
        transform: translate(-50%, 0) scale(1); 
        opacity: 1; 
      }
    }

    .notification {
      animation: notificationSlide 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
  `;
  
  document.head.appendChild(style);
}

// ✅ МАТЧ АНИМАЦИЯ С СЕРДЦАМИ
function showMatchAnimation() {
  // Создаём overlay
  const overlay = document.createElement('div');
  overlay.className = 'match-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255, 107, 107, 0.95);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
  `;
  
  overlay.innerHTML = `
    <div style="
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(30px);
      border-radius: 40px;
      padding: 60px 50px;
      text-align: center;
      color: white;
      max-width: 90%;
      animation: ${animations.matchPop};
      border: 2px solid rgba(255,255,255,0.3);
    ">
      <div style="font-size: 72px; margin-bottom: 24px; animation: heartBeat 1s infinite;">💝</div>
      <div style="font-size: 32px; font-weight: 800; margin-bottom: 16px; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">ЭТО МЭТЧ!</div>
      <div style="font-size: 20px; opacity: 0.95; margin-bottom: 40px;">Можно начать общение ✨</div>
      <button onclick="this.closest('.match-overlay').remove(); setActiveTab('chats'); setTimeout(() => hapticFeedback('success'), 100);" 
              style="
        padding: 18px 48px;
        background: rgba(255,255,255,0.9);
        color: #ff6b6b;
        border: none;
        border-radius: 30px;
        font-size: 20px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      ">
        💬 Перейти в чаты
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Сердечки фон
  createHeartExplosion();
}

// ✅ ВЗРЫВ СЕРДЕЧКАМИ
function createHeartExplosion() {
  const heartsContainer = document.createElement('div');
  heartsContainer.className = 'match-hearts';
  
  const hearts = ['❤️', '💖', '💕', '💗', '💝'];
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.top = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 0.5 + 's';
    heartsContainer.appendChild(heart);
  }
  
  document.body.appendChild(heartsContainer);
  
  setTimeout(() => heartsContainer.remove(), 2000);
}

// ✅ СВАЙП АНИМАЦИЯ КАРТОЧКИ
function showSwipeAnimation(direction) {
  const card = document.getElementById('profileCard');
  if (!card) return;
  
  card.classList.add(`swipe-${direction}`);
  
  // Звуковой эффект через haptic
  hapticFeedback(direction === 'right' ? 'heavy' : 'light');
  
  setTimeout(() => {
    card.classList.remove('swipe-left', 'swipe-right');
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = '1';
  }, 600);
}

// ✅ ЛАЙК БЕЙДЖ АНИМАЦИЯ
function animateLikesBadge() {
  const badge = document.getElementById('likesBadge');
  if (badge) {
    badge.classList.add('new-likes');
    setTimeout(() => badge.classList.remove('new-likes'), 2000);
  }
}

// ✅ КНОПКА ПУЛЬСАЦИЯ
function pulseButton(button) {
  button.style.animation = animations.pulse;
  setTimeout(() => {
    button.style.animation = '';
  }, 2000);
}

// ✅ УВЕДОМЛЕНИЕ С АНИМАЦИЕЙ
function showNotification(text, duration = 4000) {
  // Удаляем старые
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = text;
  
  notification.style.cssText = `
    position: fixed;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(50,50,50,0.95));
    backdrop-filter: blur(20px);
    color: white;
    padding: 20px 32px;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    line-height: 1.5;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.2);
    z-index: 10001;
    animation: ${animations.notificationSlide} 0.4s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'notificationSlide 0.4s ease reverse';
    setTimeout(() => notification.remove(), 400);
  }, duration);
}

// ✅ ЛОАДИНГ АНИМАЦИЯ
function showLoadingSpinner(text = 'Загрузка...') {
  const spinner = document.createElement('div');
  spinner.id = 'global-spinner';
  spinner.innerHTML = `
    <div style="
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(25px);
      padding: 40px;
      border-radius: 25px;
      text-align: center;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
      z-index: 10002;
      border: 2px solid rgba(102, 126, 234, 0.3);
    ">
      <div style="width: 48px; height: 48px; border: 3px solid #667eea40; border-top: 3px solid #667eea; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
      <div style="font-size: 18px; font-weight: 600; color: #333;">${text}</div>
    </div>
  `;
  
  document.body.appendChild(spinner);
  
  return {
    hide: () => {
      if (spinner.parentNode) {
        spinner.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => spinner.remove(), 300);
      }
    }
  };
}

// ✅ ЭКСПОРТЫ
window.AnimationUtils = {
  init: initAnimations,
  match: showMatchAnimation,
  swipe: showSwipeAnimation,
  notification: showNotification,
  hearts: createHeartExplosion,
  loading: showLoadingSpinner,
  pulseButton,
  animateLikes: animateLikesBadge
};

// 🔥 АВТОЗАГРУЗКА
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}
