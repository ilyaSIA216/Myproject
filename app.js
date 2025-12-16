// app.js - Главный файл приложения (сборка модулей)
import { initApp, domElements, loadProfile } from './core.js';
import { swipeSystem } from './swipe.js';
import { chatSystem } from './chat.js';
import { ui } from './ui.js';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // Инициализируем ядро
  initApp();
  
  // Инициализируем системы
  swipeSystem.init();
  chatSystem.init();
  
  // Установка обработчиков кнопок
  setupEventListeners();
  
  console.log('✅ Все модули загружены');
});

// Обработчики событий
function setupEventListeners() {
  // Кнопка "Начать"
  if (domElements.startBtn) {
    domElements.startBtn.addEventListener('click', handleStartClick);
  }
  
  // Кнопки табов
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
    });
  });
  
  // Кнопка сохранения профиля
  if (domElements.saveProfileBtn) {
    domElements.saveProfileBtn.addEventListener('click', handleSaveProfile);
  }
}

function handleStartClick() {
  const profile = loadProfile();
  
  if (profile) {
    // Показать главный экран
    domElements.welcomeScreen?.classList.add('hidden');
    domElements.animatedWelcomeScreen?.classList.add('hidden');
    setActiveTab('feed');
  } else {
    // Показать онбординг
    domElements.welcomeScreen?.classList.add('hidden');
    domElements.animatedWelcomeScreen?.classList.add('hidden');
    domElements.onboardingScreen?.classList.remove('hidden');
  }
}

function setActiveTab(tab) {
  // Ваша логика переключения табов
  console.log('Переключение на таб:', tab);
}

function handleSaveProfile() {
  // Ваша логика сохранения профиля
  ui.showNotification('Профиль сохранен!');
}
