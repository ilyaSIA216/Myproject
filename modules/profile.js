// modules/profile.js

window.AppProfile = {
  // Состояние профиля
  profileData: null,
  verificationStatus: 'not_verified',
  verificationPhoto: null,
  
  // Функции
  init: function() {
    console.log('👤 Инициализирую систему профиля');
    this.profileData = AppCore.loadLocalStorage("siamatch_profile");
    this.loadVerificationStatus();
    this.initEventListeners();
  },
  
  initEventListeners: function() {
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationPhotoInput = document.getElementById('verification-photo');
    const submitBtn = document.getElementById('submit-verification');
    const cancelBtn = document.getElementById('cancel-verification');
    const retryBtn = document.getElementById('retry-verification');
    
    if (verifyBtn) verifyBtn.addEventListener('click', this.handleVerificationRequest.bind(this));
    if (verificationPhotoInput) verificationPhotoInput.addEventListener('change', this.handleVerificationPhotoUpload.bind(this));
    if (submitBtn) submitBtn.addEventListener('click', this.submitVerification.bind(this));
    if (cancelBtn) cancelBtn.addEventListener('click', this.cancelVerification.bind(this));
    if (retryBtn) retryBtn.addEventListener('click', this.retryVerification.bind(this));
  },
  
  loadVerificationStatus: function() {
    const saved = AppCore.loadLocalStorage("siamatch_verification");
    if (saved) {
      this.verificationStatus = saved.status || 'not_verified';
      this.verificationPhoto = saved.photo || null;
    }
  },
  
  saveVerificationStatus: function() {
    const data = {
      status: this.verificationStatus,
      photo: this.verificationPhoto,
      timestamp: Date.now()
    };
    AppCore.saveLocalStorage("siamatch_verification", data);
  },
  
  updateVerificationUI: function() {
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationStatusElem = document.getElementById('verification-status');
    const verificationSection = document.getElementById('verification-form-section');
    const verificationPendingSection = document.getElementById('verification-pending-section');
    const verificationVerifiedSection = document.getElementById('verification-verified-section');
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    
    if (!verifyBtn || !verificationStatusElem) return;
    
    // Скрываем все секции
    [verificationSection, verificationPendingSection, verificationVerifiedSection, verificationRejectedSection]
      .forEach(section => section && section.classList.add('hidden'));
    
    verifyBtn.style.display = this.verificationStatus === 'not_verified' || this.verificationStatus === 'rejected' ? 'block' : 'none';
    
    switch(this.verificationStatus) {
      case 'not_verified':
        verificationStatusElem.textContent = 'Анкета не верифицирована';
        verificationStatusElem.className = 'profile-verification-status not-verified';
        break;
        
      case 'pending':
        verificationStatusElem.textContent = '⏳ На проверке';
        verificationStatusElem.className = 'profile-verification-status pending';
        if (verificationPendingSection) verificationPendingSection.classList.remove('hidden');
        break;
        
      case 'verified':
        verificationStatusElem.textContent = '✅ Верифицирована';
        verificationStatusElem.className = 'profile-verification-status verified';
        if (verificationVerifiedSection) verificationVerifiedSection.classList.remove('hidden');
        break;
        
      case 'rejected':
        verificationStatusElem.textContent = '❌ Отклонена';
        verificationStatusElem.className = 'profile-verification-status rejected';
        if (verificationRejectedSection) verificationRejectedSection.classList.remove('hidden');
        break;
    }
  },
  
  handleVerificationRequest: function() {
    const verificationSection = document.getElementById('verification-form-section');
    const verifyBtn = document.getElementById('verifyProfileBtn');
    
    if (verificationSection && verifyBtn) {
      verificationSection.classList.remove('hidden');
      verifyBtn.style.display = 'none';
      
      const preview = document.getElementById('verification-preview');
      if (preview) preview.style.display = 'none';
    }
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  },
  
  handleVerificationPhotoUpload: function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      AppCore.showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      this.verificationPhoto = event.target.result;
      
      const preview = document.getElementById('verification-preview');
      if (preview) {
        preview.src = this.verificationPhoto;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  },
  
  submitVerification: function() {
    if (!this.verificationPhoto) {
      AppCore.showNotification('Сначала загрузите селфи фото');
      return;
    }
    
    this.verificationStatus = 'pending';
    this.saveVerificationStatus();
    this.updateVerificationUI();
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    AppCore.showNotification('✅ Запрос на верификацию отправлен!\n\nАнкета будет проверена администратором в течение 24 часов.\n\nПосле успешной верификации вы получите +20 свайпов! 🎁');
    
    setTimeout(() => {
      if (this.verificationStatus === 'pending') {
        this.completeVerificationWithBonus();
      }
    }, 3000);
  },
  
  completeVerificationWithBonus: function() {
    this.verificationStatus = 'verified';
    this.saveVerificationStatus();
    this.updateVerificationUI();
    
    // Награда за верификацию
    if (window.AppBonus) {
      window.AppBonus.addSwipes(20);
    }
    
    AppCore.showNotification('✅ Анкета верифицирована!\n\n🎁 Вы получили +20 свайпов!');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('heavy');
      } catch (e) {}
    }
  },
  
  cancelVerification: function() {
    this.verificationPhoto = null;
    this.verificationStatus = 'not_verified';
    this.saveVerificationStatus();
    this.updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  },
  
  retryVerification: function() {
    this.verificationPhoto = null;
    this.verificationStatus = 'not_verified';
    this.saveVerificationStatus();
    this.updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    if (verificationRejectedSection) verificationRejectedSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  },
  
  // Функции для работы с профилем
  updateProfileDisplay: function() {
    if (!this.profileData) return;
    
    const profileNameElem = document.getElementById('profile-name');
    const profileAgeElem = document.getElementById('profile-age-display');
    const profileGenderElem = document.getElementById('profile-gender-display');
    const profileCityElem = document.getElementById('profile-city-display');
    const profilePhotoElem = document.getElementById('profile-photo-preview');
    
    if (profileNameElem) {
      profileNameElem.textContent = this.profileData.first_name || "Пользователь";
    }
    
    if (profileAgeElem) {
      profileAgeElem.textContent = this.profileData.age ? `${this.profileData.age} лет` : "";
    }
    
    if (profileGenderElem) {
      const genderMap = {
        'male': 'Мужской',
        'female': 'Женский'
      };
      profileGenderElem.textContent = this.profileData.gender ? genderMap[this.profileData.gender] || this.profileData.gender : "";
    }
    
    if (profileCityElem) {
      profileCityElem.textContent = this.profileData.city || "";
    }
    
    if (profilePhotoElem && this.profileData.custom_photo_url) {
      profilePhotoElem.src = this.profileData.custom_photo_url;
      profilePhotoElem.style.display = 'block';
    }
  },
  
  // Инициализация фото профиля
  initProfilePhotos: function() {
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const photoUpload = document.getElementById('profile-photo-upload');
    
    if (!this.profileData.photos) {
      this.profileData.photos = [];
      if (this.profileData.custom_photo_url) {
        this.profileData.photos.push(this.profileData.custom_photo_url);
      }
      AppCore.saveLocalStorage("siamatch_profile", this.profileData);
    }
    
    this.updateProfilePhotos();
    
    if (addPhotoBtn) {
      addPhotoBtn.addEventListener('click', () => {
        photoUpload.click();
      });
    }
    
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', this.removeCurrentPhoto.bind(this));
    }
    
    if (photoUpload) {
      photoUpload.addEventListener('change', this.handleProfilePhotoUpload.bind(this));
    }
  },
  
  updateProfilePhotos: function() {
    if (!this.profileData.photos || this.profileData.photos.length === 0) return;
    
    const container = document.querySelector('.profile-photos-container');
    const indicators = document.querySelector('.profile-photo-indicators');
    const photosCount = document.getElementById('photos-count');
    const removeBtn = document.getElementById('remove-photo-btn');
    
    if (!container || !indicators) return;
    
    container.innerHTML = '';
    
    this.profileData.photos.forEach((photoUrl, index) => {
      const img = document.createElement('img');
      img.className = `profile-main-photo ${index === 0 ? 'active' : ''}`;
      img.src = photoUrl;
      img.alt = `Фото ${index + 1}`;
      container.appendChild(img);
    });
    
    indicators.innerHTML = '';
    this.profileData.photos.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `profile-photo-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicators.appendChild(indicator);
    });
    
    if (photosCount) {
      photosCount.textContent = `${this.profileData.photos.length}/3 фото`;
    }
    
    if (removeBtn) {
      removeBtn.disabled = this.profileData.photos.length <= 1;
    }
  },
  
  handleProfilePhotoUpload: function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      AppCore.showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    if (this.profileData.photos.length >= 3) {
      AppCore.showNotification('Можно добавить не более 3 фото');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const photoUrl = event.target.result;
      
      if (!this.profileData.photos) {
        this.profileData.photos = [];
      }
      
      this.profileData.photos.push(photoUrl);
      AppCore.saveLocalStorage("siamatch_profile", this.profileData);
      this.updateProfilePhotos();
      
      AppCore.showNotification('Фото добавлено! 📸');
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  },
  
  removeCurrentPhoto: function() {
    if (!this.profileData.photos || this.profileData.photos.length <= 1) return;
    
    this.profileData.photos.splice(0, 1);
    AppCore.saveLocalStorage("siamatch_profile", this.profileData);
    this.updateProfilePhotos();
    
    AppCore.showNotification('Фото удалено');
  }
};
