// modules/bonus.js

window.AppBonus = {
  // Состояние
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
  maxInterests: 5,
  
  pendingBonusVerifications: [],
  
  // Функции
  init: function() {
    console.log('🎁 Инициализирую систему бонусов и фильтров');
    this.loadSearchFilters();
    this.loadBoostStatus();
    this.loadUserInterests();
    this.loadPendingBonuses();
    this.initEventListeners();
    this.updateBoostUI();
    setInterval(this.updateBoostTimer.bind(this), 1000);
  },
  
  initEventListeners: function() {
    const inviteFriendBtn = document.getElementById('inviteFriendBtn');
    const shareStoriesBtn = document.getElementById('shareStoriesBtn');
    const saveFiltersBtn = document.getElementById('save-filters-btn');
    const datingGoalSelect = document.getElementById('dating-goal');
    const saveDatingGoalBtn = document.getElementById('save-dating-goal');
    
    if (inviteFriendBtn) {
      inviteFriendBtn.addEventListener('click', this.handleInviteFriend.bind(this));
    }
    
    if (shareStoriesBtn) {
      shareStoriesBtn.addEventListener('click', this.handleShareStories.bind(this));
    }
    
    if (saveFiltersBtn) {
      saveFiltersBtn.addEventListener('click', this.handleSaveFilters.bind(this));
    }
    
    if (datingGoalSelect) {
      datingGoalSelect.addEventListener('change', function() {
        window.AppBonus.datingGoal = this.value;
      });
    }
    
    if (saveDatingGoalBtn) {
      saveDatingGoalBtn.addEventListener('click', this.saveDatingGoal.bind(this));
    }
  },
  
  // Функции для фильтров
  loadSearchFilters: function() {
    const saved = AppCore.loadLocalStorage("siamatch_search_filters");
    if (saved) {
      this.searchFilters = saved;
    }
  },
  
  saveSearchFilters: function() {
    AppCore.saveLocalStorage("siamatch_search_filters", this.searchFilters);
  },
  
  handleSaveFilters: function() {
    this.saveSearchFilters();
    AppCore.showNotification('✅ Фильтры применены!\n\nТеперь в ленте будут показываться только подходящие анкеты. 🎯');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  },
  
  // Функции для буста
  loadBoostStatus: function() {
    const saved = AppCore.loadLocalStorage("siamatch_boost");
    if (saved) {
      this.boostActive = saved.active || false;
      this.boostEndTime = saved.endTime || null;
      
      if (this.boostActive && this.boostEndTime) {
        if (Date.now() > this.boostEndTime) {
          this.boostActive = false;
          this.saveBoostStatus();
        }
      }
    }
  },
  
  saveBoostStatus: function() {
    const data = {
      active: this.boostActive,
      endTime: this.boostEndTime,
      timestamp: Date.now()
    };
    AppCore.saveLocalStorage("siamatch_boost", data);
  },
  
  updateBoostUI: function() {
    const boostStatusElement = document.getElementById('boost-status');
    if (boostStatusElement) {
      this.updateBoostStatusElement(boostStatusElement);
    }
  },
  
  updateBoostStatusElement: function(element) {
    if (this.boostActive && this.boostEndTime) {
      const timeLeft = this.boostEndTime - Date.now();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      element.textContent = `Активен (осталось ${hours}ч ${minutes}м)`;
      element.className = 'boost-status boosted';
    } else {
      element.textContent = 'Не активен';
      element.className = 'boost-status not-boosted';
    }
  },
  
  updateBoostTimer: function() {
    if (!this.boostActive || !this.boostEndTime) return;
    
    const now = Date.now();
    if (now >= this.boostEndTime) {
      this.boostActive = false;
      this.saveBoostStatus();
      this.updateBoostUI();
      return;
    }
    
    const timeLeft = this.boostEndTime - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const boostTimerElement = document.getElementById('boost-timer');
    if (boostTimerElement) {
      boostTimerElement.textContent = `Осталось: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  },
  
  // Функции для интересов
  loadUserInterests: function() {
    const saved = AppCore.loadLocalStorage("siamatch_interests");
    if (saved) {
      this.userInterests = saved.interests || [];
      this.datingGoal = saved.datingGoal || '';
    }
  },
  
  saveUserInterests: function() {
    const data = {
      interests: this.userInterests,
      datingGoal: this.datingGoal,
      timestamp: Date.now()
    };
    AppCore.saveLocalStorage("siamatch_interests", data);
  },
  
  saveDatingGoal: function() {
    if (!this.datingGoal) {
      AppCore.showNotification('Выберите цель знакомства');
      return;
    }
    
    this.saveUserInterests();
    AppCore.showNotification('✅ Цель знакомства сохранена!');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
  },
  
  // Функции для бонусных верификаций
  loadPendingBonuses: function() {
    const saved = AppCore.loadLocalStorage("siamatch_pending_bonuses");
    if (saved) {
      this.pendingBonusVerifications = saved;
    }
  },
  
  savePendingBonuses: function() {
    AppCore.saveLocalStorage("siamatch_pending_bonuses", this.pendingBonusVerifications);
  },
  
  handleInviteFriend: function() {
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    const referralCode = this.generateReferralCode();
    const referralLink = `https://t.me/SiaMatchBot?start=${referralCode}`;
    
    this.showInviteVerificationModal(referralLink);
  },
  
  handleShareStories: function() {
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    this.showShareVerificationModal();
  },
  
  generateReferralCode: function() {
    const profileData = window.AppProfile ? window.AppProfile.profileData : null;
    const userId = profileData?.tg_id || Math.floor(Math.random() * 1000000);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `REF_${userId}_${code}`;
  },
  
  // Вспомогательные функции
  addSwipes: function(count) {
    if (window.AppSwipe) {
      window.AppSwipe.remainingSwipes += count;
      window.AppSwipe.saveSwipesCount();
      window.AppSwipe.updateSwipesUI();
    }
  }
};
