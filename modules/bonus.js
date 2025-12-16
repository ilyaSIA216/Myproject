// modules/bonus.js - ПРОСТОЙ ИСПРАВЛЕННЫЙ ВАРИАНТ

window.AppBonus = {
  // ПЕРЕМЕННЫЕ
  searchFilters: {
    minAge: 18,
    maxAge: 35,
    genders: [],
    interests: [],
    datingGoal: ''
  },
  
  boostActive: false,
  boostEndTime: null,
  
  userInterests: [],
  datingGoal: '',
  
  pendingBonusVerifications: [],
  
  // ФУНКЦИИ
  init: function() {
    console.log('🎁 Инициализирую систему бонусов');
    
    // Загружаем данные
    this.loadSearchFilters();
    this.loadBoostStatus();
    this.loadUserInterests();
    this.loadPendingBonuses();
    
    // Настраиваем кнопки
    this.setupEventListeners();
    
    // Обновляем интерфейс
    this.updateBoostUI();
  },
  
  setupEventListeners: function() {
    // Кнопка пригласить друга
    const inviteFriendBtn = document.getElementById('inviteFriendBtn');
    if (inviteFriendBtn) {
      inviteFriendBtn.addEventListener('click', () => {
        this.handleInviteFriend();
      });
    }
    
    // Кнопка поделиться в Stories
    const shareStoriesBtn = document.getElementById('shareStoriesBtn');
    if (shareStoriesBtn) {
      shareStoriesBtn.addEventListener('click', () => {
        this.handleShareStories();
      });
    }
    
    // Кнопка сохранить фильтры
    const saveFiltersBtn = document.getElementById('save-filters-btn');
    if (saveFiltersBtn) {
      saveFiltersBtn.addEventListener('click', () => {
        this.handleSaveFilters();
      });
    }
    
    // Цель знакомства
    const datingGoalSelect = document.getElementById('dating-goal');
    if (datingGoalSelect) {
      datingGoalSelect.addEventListener('change', (e) => {
        this.datingGoal = e.target.value;
      });
    }
    
    // Кнопка сохранить цель знакомства
    const saveDatingGoalBtn = document.getElementById('save-dating-goal');
    if (saveDatingGoalBtn) {
      saveDatingGoalBtn.addEventListener('click', () => {
        this.saveDatingGoal();
      });
    }
    
    // Инициализируем чекбоксы фильтров
    this.initFilterCheckboxes();
  },
  
  initFilterCheckboxes: function() {
    // Возраст
    const searchMinAge = document.getElementById('search-min-age');
    const searchMaxAge = document.getElementById('search-max-age');
    
    if (searchMinAge) {
      searchMinAge.value = this.searchFilters.minAge;
      searchMinAge.addEventListener('change', (e) => {
        this.searchFilters.minAge = parseInt(e.target.value) || 18;
      });
    }
    
    if (searchMaxAge) {
      searchMaxAge.value = this.searchFilters.maxAge;
      searchMaxAge.addEventListener('change', (e) => {
        this.searchFilters.maxAge = parseInt(e.target.value) || 35;
      });
    }
    
    // Пол
    const genderMaleCheckbox = document.getElementById('filter-gender-male');
    const genderFemaleCheckbox = document.getElementById('filter-gender-female');
    
    if (genderMaleCheckbox) {
      genderMaleCheckbox.checked = this.searchFilters.genders.includes('male');
      genderMaleCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!this.searchFilters.genders.includes('male')) {
            this.searchFilters.genders.push('male');
          }
        } else {
          const index = this.searchFilters.genders.indexOf('male');
          if (index > -1) {
            this.searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    if (genderFemaleCheckbox) {
      genderFemaleCheckbox.checked = this.searchFilters.genders.includes('female');
      genderFemaleCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!this.searchFilters.genders.includes('female')) {
            this.searchFilters.genders.push('female');
          }
        } else {
          const index = this.searchFilters.genders.indexOf('female');
          if (index > -1) {
            this.searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    // Интересы
    document.querySelectorAll('.search-interest').forEach(checkbox => {
      checkbox.checked = this.searchFilters.interests.includes(checkbox.value);
      
      checkbox.addEventListener('change', (e) => {
        const interest = e.target.value;
        if (e.target.checked) {
          if (!this.searchFilters.interests.includes(interest)) {
            this.searchFilters.interests.push(interest);
          }
        } else {
          const index = this.searchFilters.interests.indexOf(interest);
          if (index > -1) {
            this.searchFilters.interests.splice(index, 1);
          }
        }
      });
    });
    
    // Цель знакомства в фильтрах
    const searchDatingGoalSelect = document.getElementById('search-dating-goal');
    if (searchDatingGoalSelect) {
      searchDatingGoalSelect.value = this.searchFilters.datingGoal;
      searchDatingGoalSelect.addEventListener('change', (e) => {
        this.searchFilters.datingGoal = e.target.value;
      });
    }
  },
  
  // ЗАГРУЗКА И СОХРАНЕНИЕ ДАННЫХ
  loadSearchFilters: function() {
    try {
      const saved = localStorage.getItem("siamatch_search_filters");
      if (saved) {
        const data = JSON.parse(saved);
        this.searchFilters = data;
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки фильтров:", e);
    }
  },
  
  saveSearchFilters: function() {
    try {
      localStorage.setItem("siamatch_search_filters", JSON.stringify(this.searchFilters));
    } catch (e) {
      console.error("❌ Ошибка сохранения фильтров:", e);
    }
  },
  
  loadBoostStatus: function() {
    try {
      const saved = localStorage.getItem("siamatch_boost");
      if (saved) {
        const data = JSON.parse(saved);
        this.boostActive = data.active || false;
        this.boostEndTime = data.endTime || null;
        
        // Проверяем не истек ли буст
        if (this.boostActive && this.boostEndTime) {
          if (Date.now() > this.boostEndTime) {
            this.boostActive = false;
            this.saveBoostStatus();
          }
        }
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки статуса буста:", e);
    }
  },
  
  saveBoostStatus: function() {
    try {
      const data = {
        active: this.boostActive,
        endTime: this.boostEndTime,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_boost", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса буста:", e);
    }
  },
  
  loadUserInterests: function() {
    try {
      const saved = localStorage.getItem("siamatch_interests");
      if (saved) {
        const data = JSON.parse(saved);
        this.userInterests = data.interests || [];
        this.datingGoal = data.datingGoal || '';
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки интересов:", e);
    }
  },
  
  saveUserInterests: function() {
    try {
      const data = {
        interests: this.userInterests,
        datingGoal: this.datingGoal,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_interests", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения интересов:", e);
    }
  },
  
  loadPendingBonuses: function() {
    try {
      const saved = localStorage.getItem("siamatch_pending_bonuses");
      if (saved) {
        this.pendingBonusVerifications = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки ожидающих бонусов:", e);
    }
  },
  
  savePendingBonuses: function() {
    try {
      localStorage.setItem("siamatch_pending_bonuses", JSON.stringify(this.pendingBonusVerifications));
    } catch (e) {
      console.error("❌ Ошибка сохранения ожидающих бонусов:", e);
    }
  },
  
  // ОБРАБОТЧИКИ КНОПОК
  handleSaveFilters: function() {
    this.saveSearchFilters();
    
    // Показываем уведомление
    if (window.AppCore && window.AppCore.showNotification) {
      window.AppCore.showNotification('✅ Фильтры применены!');
    } else {
      alert('Фильтры применены!');
    }
    
    // Вибрация если есть
    if (window.AppCore && window.AppCore.tg && window.AppCore.tg.HapticFeedback) {
      try {
        window.AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  },
  
  handleInviteFriend: function() {
    // Простая версия
    const referralLink = `https://t.me/SiaMatchBot?start=ref_${Date.now()}`;
    
    if (window.AppCore && window.AppCore.showNotification) {
      window.AppCore.showNotification(`👥 Пригласите друга по ссылке:\n\n${referralLink}\n\nСкопируйте и отправьте другу!`);
    } else {
      alert(`Пригласите друга по ссылке: ${referralLink}`);
    }
    
    // Вибрация
    if (window.AppCore && window.AppCore.tg && window.AppCore.tg.HapticFeedback) {
      try {
        window.AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  },
  
  handleShareStories: function() {
    if (window.AppCore && window.AppCore.showNotification) {
      window.AppCore.showNotification('📱 Поделитесь скриншотом приложения в Stories!\n\nПосле публикации отправьте скриншот администратору для получения буста.');
    } else {
      alert('Поделитесь скриншотом приложения в Stories для получения буста!');
    }
    
    // Вибрация
    if (window.AppCore && window.AppCore.tg && window.AppCore.tg.HapticFeedback) {
      try {
        window.AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  },
  
  saveDatingGoal: function() {
    if (!this.datingGoal) {
      if (window.AppCore && window.AppCore.showNotification) {
        window.AppCore.showNotification('Выберите цель знакомства');
      }
      return;
    }
    
    this.saveUserInterests();
    
    if (window.AppCore && window.AppCore.showNotification) {
      window.AppCore.showNotification('✅ Цель знакомства сохранена!');
    }
    
    // Вибрация
    if (window.AppCore && window.AppCore.tg && window.AppCore.tg.HapticFeedback) {
      try {
        window.AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
  },
  
  // ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
  updateBoostUI: function() {
    const boostStatusElement = document.getElementById('boost-status');
    if (!boostStatusElement) return;
    
    if (this.boostActive && this.boostEndTime) {
      const timeLeft = this.boostEndTime - Date.now();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      boostStatusElement.textContent = `Активен (осталось ${hours}ч ${minutes}м)`;
      boostStatusElement.className = 'boost-status boosted';
    } else {
      boostStatusElement.textContent = 'Не активен';
      boostStatusElement.className = 'boost-status not-boosted';
    }
  },
  
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  addSwipes: function(count) {
    // Добавляем свайпы в модуль свайпов
    if (window.AppSwipe && window.AppSwipe.addSwipes) {
      window.AppSwipe.addSwipes(count);
    }
  },
  
  activateBoost: function(hours) {
    this.boostActive = true;
    this.boostEndTime = Date.now() + (hours * 60 * 60 * 1000);
    this.saveBoostStatus();
    this.updateBoostUI();
    
    if (window.AppCore && window.AppCore.showNotification) {
      window.AppCore.showNotification(`🚀 Буст активирован на ${hours} часов!`);
    }
  }
};
