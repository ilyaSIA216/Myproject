document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // Импорты функций будут доступны после их создания
  import { initTelegram, setupKeyboardHandlers, isIOS, tg } from './logic.js';
  import { 
    initUI, 
    setupStartButton, 
    setupTabButtons, 
    showAnimatedWelcomeScreen,
    showNotification 
  } from './ui.js';
  import { 
    loadProfile, 
    saveProfile, 
    profileData,
    loadPendingBonuses 
  } from './logic.js';
  
  // ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
  let hasInitialized = false;
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    if (hasInitialized) return;
    hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    initTelegram();
    initUI();
    
    profileData.current = loadProfile();
    
    if (profileData.current) {
      showAnimatedWelcomeScreen();
    } else {
      const welcomeScreen = document.getElementById("welcome-screen");
      if (welcomeScreen) {
        welcomeScreen.classList.remove("hidden");
      }
    }
    
    const onboardingScreen = document.getElementById("onboarding-screen");
    const tabBar = document.getElementById("tab-bar");
    
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    if (tabBar) tabBar.classList.add("hidden");
    
    // Инициализация всех систем
    setTimeout(() => {
      import('./logic.js').then(({ initAllSystems }) => {
        initAllSystems();
      });
    }, 100);
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
