// ===== UTILS/SWIPE.JS — TINDER СВАЙПЫ И ФОТО =====

// ✅ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ СВАЙПОВ (из твоего logic.js)
let swipeStartX = 0;
let swipeStartY = 0;
let isSwiping = false;
let currentPhotoIndex = 0;
let candidatePhotos = [];
let candidateInterests = [];
let currentCandidateId = null;

// ✅ ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ СВАЙПОВ
function initSwipeSystem() {
  console.log('👆 Инициализирую Tinder свайпы');
  
  const card = document.getElementById('profileCard');
  if (!card) return;
  
  // ✅ TOUCH СОБЫТИЯ (мобильные)
  card.addEventListener('touchstart', handleTouchStart, { passive: true });
  card.addEventListener('touchmove', handleTouchMove, { passive: false });
  card.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // ✅ MOUSE СОБЫТИЯ (десктоп)
  card.addEventListener('mousedown', handleMouseDown);
  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseup', handleMouseEnd);
  card.addEventListener('mouseleave', handleMouseLeave);
  
  // Кнопки свайпов
  document.getElementById('dislikeBtn')?.addEventListener('click', handleDislike);
  document.getElementById('likeBtn')?.addEventListener('click', handleLike);
}

// ===== TOUCH ОБРАБОТЧИКИ =====
function handleTouchStart(e) {
  const touch = e.touches[0];
  swipeStartX = touch.clientX;
  swipeStartY = touch.clientY;
  isSwiping = false;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'none';
}

function handleTouchMove(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - swipeStartX;
  const deltaY = touch.clientY - swipeStartY;
  
  // Блокируем вертикальный скролл при горизонтальном свайпе
  if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isSwiping = false;
    return;
  }
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
    isSwiping = true;
    
    const card = document.getElementById('profileCard');
    const opacity = 1 - Math.abs(deltaX) / 300;
    
    // 🔥 TINDER АНИМАЦИЯ
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    card.style.opacity = Math.max(opacity, 0.5);
    
    // Показываем фидбек
    if (deltaX > 50) {
      showSwipeFeedback('like');
    } else if (deltaX < -50) {
      showSwipeFeedback('dislike');
    }
  }
}

function handleTouchEnd(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - swipeStartX;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
  
  // СВАЙП УСПЕШЕН
  if (isSwiping && Math.abs(deltaX) > 100) {
    if (deltaX > 0) {
      handleSwipeRight();
    } else {
      handleSwipeLeft();
    }
  } else {
    // ВОЗВРАТ НА МЕСТО
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = 1;
  }
  
  resetSwipeState();
}

// ===== MOUSE ОБРАБОТЧИКИ (Десктоп) =====
function handleMouseDown(e) {
  swipeStartX = e.clientX;
  swipeStartY = e.clientY;
  isSwiping = false;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'none';
  card.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const deltaX = e.clientX - swipeStartX;
  const deltaY = e.clientY - swipeStartY;
  
  if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isSwiping = false;
    return;
  }
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
    isSwiping = true;
    
    const card = document.getElementById('profileCard');
    const opacity = 1 - Math.abs(deltaX) / 300;
    
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    card.style.opacity = Math.max(opacity, 0.5);
    
    if (deltaX > 50) showSwipeFeedback('like');
    else if (deltaX < -50) showSwipeFeedback('dislike');
  }
}

function handleMouseEnd(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const deltaX = e.clientX - swipeStartX;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
  card.style.cursor = 'grab';
  
  if (isSwiping && Math.abs(deltaX) > 100) {
    if (deltaX > 0) handleSwipeRight();
    else handleSwipeLeft();
  } else {
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = 1;
  }
  
  resetSwipeState();
}

function handleMouseLeave(e) {
  if (!isSwiping) return;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s ease, opacity 0.3s ease';
  card.style.cursor = 'grab';
  card.style.transform = 'translateX(0) rotate(0deg)';
  card.style.opacity = 1;
  
  resetSwipeState();
}

// ===== ОСНОВНЫЕ СВАЙПЫ =====
function handleSwipeRight() {
  showSwipeAnimation('right');
  setTimeout(() => handleLike(), 300);
}

function handleSwipeLeft() {
  showSwipeAnimation('left');
  setTimeout(() => handleDislike(), 300);
}

// ===== КНОПКИ СВАЙПОВ =====
function handleLike() {
  if (!useSwipe()) return; // Твоя логика из logic.js
  
  likedIds.push(currentCandidateId);
  hapticFeedback('heavy');
  
  setTimeout(() => {
    currentIndex++;
    showCurrentCandidate();
    
    // 🎲 Шанс мэтча 30%
    if (Math.random() < 0.3) {
      setTimeout(showMatchAnimation, 500);
    }
    
    updateLikesUI();
  }, 400);
}

function handleDislike() {
  if (!useSwipe()) return;
  
  hapticFeedback('light');
  
  setTimeout(() => {
    currentIndex++;
    showCurrentCandidate();
  }, 400);
}

// ===== АНИМАЦИИ СВАЙПОВ =====
function showSwipeAnimation(direction) {
  const card = document.getElementById('profileCard');
  
  if (direction === 'left') {
    card.classList.add('swipe-left');
  } else {
    card.classList.add('swipe-right');
  }
  
  setTimeout(() => {
    card.classList.remove('swipe-left', 'swipe-right');
  }, 500);
}

function showSwipeFeedback(type) {
  const feedback = document.createElement('div');
  feedback.id = 'swipe-feedback';
  feedback.className = `swipe-feedback ${type}`;
  feedback.textContent = type === 'like' ? '❤️' : '❌';
  feedback.style.cssText = `
    position: fixed;
    font-size: 80px;
    pointer-events: none;
    z-index: 200;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(feedback);
  
  requestAnimationFrame(() => {
    feedback.style.opacity = '1';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.2)';
  });
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => feedback.remove(), 300);
  }, 800);
}

// ===== СИСТЕМА ФОТО =====
function initPhotoSwitching(container) {
  if (!container) return;
  
  container.addEventListener('click', handlePhotoClick);
  container.addEventListener('touchstart', handlePhotoTouchStart, { passive: true });
  container.addEventListener('touchend', handlePhotoTouchEnd, { passive: true });
  
  if (candidatePhotos.length > 1) {
    createPhotoDots(container, candidatePhotos.length);
  }
}

let photoSwipeStartX = 0;
let photoSwipeStartY = 0;

function handlePhotoTouchStart(e) {
  const touch = e.touches[0];
  photoSwipeStartX = touch.clientX;
  photoSwipeStartY = touch.clientY;
}

function handlePhotoTouchEnd(e) {
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - photoSwipeStartX;
  const deltaY = touch.clientY - photoSwipeStartY;
  
  if (Math.abs(deltaX) > 30 && Math.abs(deltaY) < 50) {
    if (deltaX > 0) switchPhoto(-1);
    else switchPhoto(1);
  }
}

function handlePhotoClick(e) {
  if (e.target.classList.contains('photo-dot')) return;
  
  const container = e.currentTarget;
  const rect = container.getBoundingClientRect();
  const clickX = e.clientX || e.touches[0].clientX;
  const position = (clickX - rect.left) / rect.width;
  
  if (candidatePhotos.length > 1) {
    if (position < 0.33) switchPhoto(-1);
    else if (position > 0.67) switchPhoto(1);
  }
}

function switchPhoto(direction) {
  if (candidatePhotos.length <= 1) return;
  
  currentPhotoIndex += direction;
  if (currentPhotoIndex < 0) currentPhotoIndex = candidatePhotos.length - 1;
  if (currentPhotoIndex >= candidatePhotos.length) currentPhotoIndex = 0;
  
  updateCandidatePhoto();
  updatePhotoDots(document.querySelector('.candidate-photos-container'));
  
  hapticFeedback('light');
}

function updateCandidatePhoto() {
  const photo = document.getElementById('candidate-photo');
  if (photo && candidatePhotos[currentPhotoIndex]) {
    photo.src = candidatePhotos[currentPhotoIndex];
  }
}

// ===== КРУЖКИ ПАГИНАЦИИ =====
function createPhotoDots(container, count) {
  container.querySelectorAll('.photo-dot').forEach(el => el.remove());
  
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'photo-dots';
  
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = `photo-dot ${i === currentPhotoIndex ? 'active' : ''}`;
    dot.dataset.index = i;
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      if (parseInt(dot.dataset.index) !== currentPhotoIndex) {
        currentPhotoIndex = parseInt(dot.dataset.index);
        updateCandidatePhoto();
        updatePhotoDots(container);
      }
    });
    dotsContainer.appendChild(dot);
  }
  
  container.appendChild(dotsContainer);
}

function updatePhotoDots(container) {
  container.querySelectorAll('.photo-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentPhotoIndex);
  });
}

// ===== УТИЛИТЫ =====
function resetSwipeState() {
  swipeStartX = 0;
  swipeStartY = 0;
  isSwiping = false;
}

// Глобальный экспорт
window.SwipeUtils = {
  init: initSwipeSystem,
  initPhotos: initPhotoSwitching,
  like: handleLike,
  dislike: handleDislike
};
