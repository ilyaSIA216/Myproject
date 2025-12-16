// swipe.js - Система свайпов и фотографий
import { appState, domElements } from './core.js';

// Переменные для свайпов
let swipeStartX = 0;
let swipeStartY = 0;
let isSwiping = false;
let currentCandidateId = null;
let candidatePhotos = [];
let currentPhotoIndex = 0;
let candidateInterests = [];
let touchStartTime = 0;
let isTouchForPhoto = false;
let photoSwipeStartX = 0;
let photoSwipeStartY = 0;

// Система свайпов
export const swipeSystem = {
  remainingSwipes: 20,
  maxSwipesPerDay: 20,
  
  init() {
    console.log('🔄 Инициализирую систему свайпов и фотографий');
    this.loadSwipesCount();
    this.initSwipeGestures();
    this.initPhotoSwitching();
    this.setupSwipeButtons();
  },
  
  loadSwipesCount() {
    try {
      const saved = localStorage.getItem("siamatch_swipes");
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          this.remainingSwipes = data.remaining || this.maxSwipesPerDay;
        } else {
          this.remainingSwipes = this.maxSwipesPerDay;
          this.saveSwipesCount();
        }
      }
      this.updateSwipesUI();
    } catch (e) {
      console.error("❌ Ошибка загрузки количества свайпов:", e);
    }
  },
  
  saveSwipesCount() {
    try {
      const data = {
        date: new Date().toDateString(),
        remaining: this.remainingSwipes,
        totalUsed: this.maxSwipesPerDay - this.remainingSwipes
      };
      localStorage.setItem("siamatch_swipes", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения количества свайпов:", e);
    }
  },
  
  updateSwipesUI() {
    const remainingSwipesElement = document.getElementById('remaining-swipes');
    const swipesInfo = document.getElementById('swipes-info');
    
    if (remainingSwipesElement) {
      remainingSwipesElement.textContent = this.remainingSwipes;
    }
    
    if (swipesInfo) {
      if (this.remainingSwipes <= 5) {
        swipesInfo.classList.remove('hidden');
      } else {
        swipesInfo.classList.add('hidden');
      }
    }
  },
  
  useSwipe() {
    if (this.remainingSwipes > 0) {
      this.remainingSwipes--;
      this.saveSwipesCount();
      this.updateSwipesUI();
      return true;
    } else {
      this.showNotification('🚫 Свайпы на сегодня закончились!');
      return false;
    }
  },
  
  initSwipeGestures() {
    const candidateCard = document.getElementById('candidate-card');
    if (!candidateCard) return;
    
    // Тач-устройства
    candidateCard.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    candidateCard.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    candidateCard.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Десктоп
    candidateCard.addEventListener('mousedown', this.handleMouseDown.bind(this));
    candidateCard.addEventListener('mousemove', this.handleMouseMove.bind(this));
    candidateCard.addEventListener('mouseup', this.handleMouseEnd.bind(this));
    candidateCard.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  },
  
  initPhotoSwitching() {
    const photosContainer = document.querySelector('.candidate-photos-container');
    if (!photosContainer) return;
    
    photosContainer.addEventListener('click', this.handlePhotoClick.bind(this));
    photosContainer.addEventListener('touchstart', this.handlePhotoTouchStart.bind(this), { passive: true });
    photosContainer.addEventListener('touchend', this.handlePhotoTouchEnd.bind(this), { passive: true });
    
    this.createPhotoSwipeIndicators(photosContainer);
  },
  
  // Обработчики свайпов (сокращенные версии)
  handleTouchStart(e) {
    const touch = e.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    isSwiping = false;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) candidateCard.style.transition = 'none';
  },
  
  handleTouchMove(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    
    if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      isSwiping = false;
      return;
    }
    
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      isSwiping = true;
      
      const candidateCard = document.getElementById('candidate-card');
      const opacity = 1 - Math.abs(deltaX) / 300;
      
      if (candidateCard) {
        candidateCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
        candidateCard.style.opacity = Math.max(opacity, 0.5);
      }
      
      if (deltaX > 50) {
        this.showSwipeFeedback('like');
      } else if (deltaX < -50) {
        this.showSwipeFeedback('dislike');
      }
    }
  },
  
  handleTouchEnd(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
      candidateCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      if (isSwiping && Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          this.handleSwipeRight();
        } else {
          this.handleSwipeLeft();
        }
      } else {
        candidateCard.style.transform = 'translateX(0) rotate(0deg)';
        candidateCard.style.opacity = 1;
      }
    }
    
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  },
  
  handleSwipeRight() {
    this.showSwipeAnimation('right');
    setTimeout(() => {
      this.handleLike();
    }, 300);
  },
  
  handleSwipeLeft() {
    this.showSwipeAnimation('left');
    setTimeout(() => {
      this.handleDislike();
    }, 300);
  },
  
  handleLike() {
    if (!this.useSwipe()) return;
    
    if (appState.tg?.HapticFeedback) {
      try {
        appState.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    // Ваша логика лайка...
  },
  
  handleDislike() {
    if (!this.useSwipe()) return;
    
    if (appState.tg?.HapticFeedback) {
      try {
        appState.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    // Ваша логика дизлайка...
  },
  
  // Кнопки свайпов
  setupSwipeButtons() {
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    
    if (likeBtn) {
      likeBtn.addEventListener('click', () => {
        this.handleLike();
        this.showSwipeAnimation('right');
      });
    }
    
    if (dislikeBtn) {
      dislikeBtn.addEventListener('click', () => {
        this.handleDislike();
        this.showSwipeAnimation('left');
      });
    }
  },
  
  showSwipeAnimation(direction) {
    const candidateCard = document.getElementById('candidate-card');
    if (!candidateCard) return;
    
    if (direction === 'left') {
      candidateCard.classList.add('swipe-left');
    } else {
      candidateCard.classList.add('swipe-right');
    }
    
    setTimeout(() => {
      candidateCard.classList.remove('swipe-left', 'swipe-right');
      candidateCard.style.transform = 'translateX(0) rotate(0deg)';
      candidateCard.style.opacity = 1;
    }, 500);
  },
  
  showSwipeFeedback(type) {
    const feedback = document.getElementById('swipe-feedback');
    if (!feedback) return;
    
    feedback.textContent = type === 'like' ? '❤️' : '✖️';
    feedback.className = `swipe-feedback ${type}`;
    feedback.classList.remove('hidden');
    
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 800);
  },
  
  // Фото свайпы
  handlePhotoTouchStart(e) {
    const touch = e.touches[0];
    photoSwipeStartX = touch.clientX;
    photoSwipeStartY = touch.clientY;
    touchStartTime = Date.now();
    isTouchForPhoto = true;
  },
  
  handlePhotoTouchEnd(e) {
    if (!isTouchForPhoto) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - photoSwipeStartX;
    const deltaY = touch.clientY - photoSwipeStartY;
    const touchDuration = Date.now() - touchStartTime;
    
    if (touchDuration < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      this.handlePhotoClick(e);
    } else if (Math.abs(deltaX) > 30 && Math.abs(deltaY) < 50) {
      if (deltaX > 0) {
        this.switchPhoto(-1);
      } else {
        this.switchPhoto(1);
      }
    }
    
    isTouchForPhoto = false;
  },
  
  handlePhotoClick(e) {
    if (e.target.classList.contains('photo-swipe-indicator')) return;
    
    const photoRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || (e.touches && e.touches[0].clientX);
    
    if (clickX) {
      const photoWidth = photoRect.width;
      const clickPosition = clickX - photoRect.left;
      
      if (clickPosition < photoWidth / 3) {
        this.switchPhoto(-1);
      } else if (clickPosition > (photoWidth / 3) * 2) {
        this.switchPhoto(1);
      }
    }
  },
  
  switchPhoto(direction) {
    if (candidatePhotos.length <= 1) return;
    
    const oldIndex = currentPhotoIndex;
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
      currentPhotoIndex = candidatePhotos.length - 1;
    } else if (currentPhotoIndex >= candidatePhotos.length) {
      currentPhotoIndex = 0;
    }
    
    this.updateCandidatePhoto();
    this.updatePhotoIndicators();
    
    const photoElement = document.getElementById('candidate-photo');
    if (photoElement) {
      photoElement.style.transition = 'opacity 0.3s ease';
      photoElement.style.opacity = '0';
      
      setTimeout(() => {
        photoElement.style.opacity = '1';
      }, 50);
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  },
  
  updateCandidatePhoto() {
    if (candidatePhotos.length > 0 && currentPhotoIndex < candidatePhotos.length) {
      const photoUrl = candidatePhotos[currentPhotoIndex];
      const photoElement = document.getElementById("candidate-photo");
      
      if (photoElement) {
        photoElement.src = photoUrl;
      }
    }
  },
  
  updatePhotoIndicators() {
    const indicatorsContainer = document.querySelector('.photo-indicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < candidatePhotos.length; i++) {
      const indicator = document.createElement('div');
      indicator.className = `photo-indicator ${i === currentPhotoIndex ? 'active' : ''}`;
      indicator.dataset.index = i;
      
      indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        currentPhotoIndex = i;
        this.updateCandidatePhoto();
        this.updatePhotoIndicators();
      });
      
      indicatorsContainer.appendChild(indicator);
    }
  },
  
  createPhotoSwipeIndicators(container) {
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'photo-swipe-indicator left';
    leftIndicator.innerHTML = '◀';
    leftIndicator.style.cssText = `
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      color: white;
      background: rgba(0,0,0,0.3);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      pointer-events: none;
      z-index: 5;
    `;
    
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'photo-swipe-indicator right';
    rightIndicator.innerHTML = '▶';
    rightIndicator.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      color: white;
      background: rgba(0,0,0,0.3);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      pointer-events: none;
      z-index: 5;
    `;
    
    container.appendChild(leftIndicator);
    container.appendChild(rightIndicator);
  },
  
  showNotification(message) {
    // Простая версия для этого модуля
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      z-index: 9999;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }
};
