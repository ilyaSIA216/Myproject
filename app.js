document.addEventListener('DOMContentLoaded', function() {
  console.log('SiaMatch приложение запускается...');
  
  // ===== Telegram WebApp инициализация =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  try {
    if (window.Telegram && Telegram.WebApp) {
      tg = Telegram.WebApp;
      console.log('Telegram WebApp обнаружен, платформа:', tg.platform);
      
      tg.ready();
      tg.expand(); // Полноэкранный режим
      
      // Настройки для iOS
      if (isIOS || tg.platform === 'ios' || tg.platform === 'macos') {
        console.log('iOS обнаружен, применяем исправления...');
        document.body.classList.add('no-bounce');
        
        // Исправляем высоту viewport на iOS
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
          setTimeout(setVH, 300);
        });
      }
      
      // Обновляем viewport после загрузки
      setTimeout(() => {
        if (tg && typeof tg.requestViewport === 'function') {
          tg.requestViewport();
        }
      }, 500);
    } else {
      console.log('Telegram WebApp не найден, запуск в браузере');
    }
  } catch (e) {
    console.error("Ошибка инициализации Telegram WebApp:", e);
  }

  // ===== DOM элементы =====
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const headerBlock = document.querySelector('.header-block');

  // ===== ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
  let user = tg?.initDataUnsafe?.user || null;
  console.log('Данные пользователя:', user);
  
  // Заполняем имя пользователя на приветственном экране
  if (user && usernameElem) {
    const name = user.first_name || user.username || "друг";
    usernameElem.textContent = `Привет, ${name}!`;
  } else {
    usernameElem.textContent = "Привет, друг! 👋";
    user = { id: 1, first_name: "Тестовый", username: "user" };
  }

  // ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
  let profileData = null;
  let candidates = [
    {id:1,name:"Алина",age:24,gender:"female",city:"Москва",bio:"Люблю кофе ☕ Москва ❤️",photo:"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:2,name:"Дмитрий",age:28,gender:"male",city:"Санкт-Петербург",bio:"Инженер СПб",photo:"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:3,name:"Екатерина",age:26,gender:"female",city:"Москва",bio:"Фотограф ❤️",photo:"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:4,name:"Алексей",age:30,gender:"male",city:"Казань",bio:"Спортсмен Казань",photo:"https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=800"}
  ];
  
  let currentIndex = 0;
  let likedIds = [];

  // ===== ФУНКЦИИ РАБОТЫ С LOCALSTORAGE =====
  function loadProfile() {
    try {
      const raw = localStorage.getItem("siamatch_profile");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Ошибка загрузки профиля:", e);
      return null;
    }
  }

  function saveProfile(obj) {
    try {
      localStorage.setItem("siamatch_profile", JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error("Ошибка сохранения профиля:", e);
      return false;
    }
  }

  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
  if (startBtn) {
    console.log('Кнопка "Начать знакомство" найдена');
    
    // Убираем все старые обработчики
    startBtn.onclick = null;
    startBtn.ontouchstart = null;
    
    // Добавляем новый надежный обработчик
    startBtn.addEventListener('click', handleStartButton, { passive: true });
    
    // Также добавляем для touch устройств
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleStartButton();
    }, { passive: false });
    
    // Визуальная обратная связь
    startBtn.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.96)';
      this.style.opacity = '0.85';
    }, { passive: true });
    
    startBtn.addEventListener('touchend', function() {
      this.style.transform = '';
      this.style.opacity = '1';
    }, { passive: true });
  }

  function handleStartButton() {
    console.log('Кнопка "Начать знакомство" нажата!');
    
    // Haptic feedback если доступно
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {
        console.log('Haptic feedback недоступен');
      }
    }
    
    // Проверяем, есть ли сохраненный профиль
    profileData = loadProfile();
    
    if (profileData) {
      // Если профиль уже есть, сразу переходим к ленте
      console.log('Профиль уже существует, переходим к ленте');
      if (welcomeScreen) welcomeScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.remove("hidden");
      setActiveTab("feed");
    } else {
      // Если профиля нет, показываем анкету
      console.log('Профиля нет, показываем анкету');
      if (welcomeScreen) welcomeScreen.classList.add("hidden");
      if (onboardingScreen) {
        onboardingScreen.classList.remove("hidden");
        // Скрываем верхний блок
        if (headerBlock) headerBlock.classList.add("hidden");
      }
      if (tabBar) tabBar.classList.add("hidden");
    }
    
    // Прокручиваем к началу
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    }, 100);
  }

  // ===== ОБРАБОТЧИК КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
  if (saveProfileBtn) {
    saveProfileBtn.onclick = null;
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      handleSaveProfile();
    }, { passive: false });
  }

  function handleSaveProfile() {
    console.log('Сохранение профиля...');
    
    // Получаем значения из формы
    const ageValue = Number(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value;
    const bio = document.getElementById("bio").value.trim();

    // Валидация
    if (!ageValue || ageValue < 18 || ageValue > 99) {
      alert("Возраст должен быть от 18 до 99 лет");
      return;
    }
    if (!gender) {
      alert("Выберите пол");
      return;
    }
    if (!city) {
      alert("Выберите город");
      return;
    }
    if (bio.length < 10) {
      alert("О себе минимум 10 символов");
      return;
    }

    // Создаем профиль
    profileData = {
      tg_id: user?.id || 1,
      first_name: user?.first_name || "Тестовый",
      username: user?.username || "user",
      age: ageValue,
      gender,
      city,
      bio,
      min_age_filter: 18,
      max_age_filter: 35,
      max_distance_km: 50,
      use_geolocation: false
    };

    // Сохраняем
    if (saveProfile(profileData)) {
      console.log('Профиль успешно сохранен');
      
      // Haptic feedback
      if (tg && tg.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
      }
      
      // Переходим к ленте
      if (onboardingScreen) onboardingScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.remove("hidden");
      setActiveTab("feed");
      
      // Показываем сообщение
      setTimeout(() => {
        alert("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀");
      }, 300);
    } else {
      alert("❌ Ошибка при сохранении профиля");
    }
  }

  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    console.log('Активируем таб:', tab);
    
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Скрываем верхний блок на всех экранах кроме приветственного
    if (headerBlock) headerBlock.classList.add("hidden");
    
    // Показываем выбранный экран
    const screenId = 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    // Обновляем активные кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Инициализируем экран
    if (tab === 'feed') {
      initFeed();
    } else if (tab === 'profile') {
      initProfile();
    }
    
    // Прокручиваем вверх
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }

  // Инициализация обработчиков табов
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
      
      // Haptic feedback
      if (tg && tg.HapticFeedback) {
        try {
          tg.HapticFeedback.selectionChanged();
        } catch (e) {}
      }
    });
    
    // Touch feedback
    btn.addEventListener('touchstart', function() {
      this.style.opacity = '0.7';
    }, { passive: true });
    
    btn.addEventListener('touchend', function() {
      this.style.opacity = '1';
    }, { passive: true });
  });

  // ===== ЛЕНТА СВАЙПОВ =====
  function initFeed() {
    console.log('Инициализация ленты...');
    currentIndex = 0;
    showCurrentCandidate();
    
    // Инициализация кнопок ленты
    const btnLike = document.getElementById("btn-like");
    const btnDislike = document.getElementById("btn-dislike");
    
    if (btnLike) {
      btnLike.onclick = null;
      btnLike.addEventListener('click', handleLike);
    }
    
    if (btnDislike) {
      btnDislike.onclick = null;
      btnDislike.addEventListener('click', handleDislike);
    }
  }

  function showCurrentCandidate() {
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    
    if (currentIndex >= filteredCandidates.length) {
      // Показываем сообщение, что кандидаты закончились
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      return;
    }
    
    const candidate = filteredCandidates[currentIndex];
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("candidate-photo").src = candidate.photo;
    document.getElementById("feed-status").textContent = "";
  }

  function handleLike() {
    console.log('Лайк!');
    
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filteredCandidates.length) {
      likedIds.push(filteredCandidates[currentIndex].id);
      currentIndex++;
      showCurrentCandidate();
    }
  }

  function handleDislike() {
    console.log('Дизлайк!');
    
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filteredCandidates.length) {
      currentIndex++;
      showCurrentCandidate();
    }
  }

  // ===== ПРОФИЛЬ =====
  function initProfile() {
    console.log('Инициализация профиля...');
    
    // Загружаем профиль
    profileData = loadProfile();
    
    if (profileData) {
      // Заполняем поля профиля
      document.getElementById("profile-age").value = profileData.age || "";
      document.getElementById("profile-gender").value = profileData.gender || "";
      document.getElementById("profile-city").value = profileData.city || "";
      document.getElementById("profile-bio").value = profileData.bio || "";
      document.getElementById("profile-min-age").value = profileData.min_age_filter || 18;
      document.getElementById("profile-max-age").value = profileData.max_age_filter || 35;
      document.getElementById("profile-max-distance").value = profileData.max_distance_km || 50;
      
      const geoCheckbox = document.getElementById("profile-use-geolocation");
      if (geoCheckbox) {
        geoCheckbox.checked = profileData.use_geolocation || false;
      }
      
      // Показываем фото если есть
      if (profileData.custom_photo_url) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
          preview.src = profileData.custom_photo_url;
          preview.style.display = 'block';
        }
      }
    }
    
    // Инициализация кнопки обновления профиля
    const updateProfileBtn = document.getElementById("updateProfileBtn");
    if (updateProfileBtn) {
      updateProfileBtn.onclick = null;
      updateProfileBtn.addEventListener('click', handleUpdateProfile);
    }
  }

  function handleUpdateProfile() {
    console.log('Обновление профиля...');
    
    if (!profileData) {
      alert("Сначала создайте профиль!");
      return;
    }
    
    // Обновляем данные
    profileData.age = Number(document.getElementById("profile-age").value);
    profileData.gender = document.getElementById("profile-gender").value;
    profileData.city = document.getElementById("profile-city").value;
    profileData.bio = document.getElementById("profile-bio").value.trim();
    profileData.min_age_filter = Number(document.getElementById("profile-min-age").value);
    profileData.max_age_filter = Number(document.getElementById("profile-max-age").value);
    profileData.max_distance_km = Number(document.getElementById("profile-max-distance").value);
    
    const geoCheckbox = document.getElementById("profile-use-geolocation");
    if (geoCheckbox) {
      profileData.use_geolocation = geoCheckbox.checked;
    }
    
    // Сохраняем
    if (saveProfile(profileData)) {
      alert("✅ Профиль обновлён!");
      
      // Haptic feedback
      if (tg && tg.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
    } else {
      alert("❌ Ошибка при обновлении профиля");
    }
  }

  // ===== ЗАГРУЗКА ФОТО ПРОФИЛЯ =====
  const profilePhotoInput = document.getElementById('profile-photo');
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Фото слишком большое (максимум 5MB)');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          const preview = document.getElementById('photo-preview');
          if (preview) {
            preview.src = event.target.result;
            preview.style.display = 'block';
          }
          
          // Сохраняем фото в профиль
          if (profileData) {
            profileData.custom_photo_url = event.target.result;
            saveProfile(profileData);
          }
          
          alert('Фото загружено! 📸');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
  function initApp() {
    console.log('Инициализация приложения...');
    
    // Загружаем профиль
    profileData = loadProfile();
    
    if (!profileData) {
      // Профиля нет - показываем приветственный экран
      console.log('Профиля нет, показываем приветственный экран');
      if (welcomeScreen) welcomeScreen.classList.remove("hidden");
      if (onboardingScreen) onboardingScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.add("hidden");
    } else {
      // Профиль есть - сразу показываем ленту
      console.log('Профиль есть, показываем ленту');
      if (welcomeScreen) welcomeScreen.classList.add("hidden");
      if (onboardingScreen) onboardingScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.remove("hidden");
      setActiveTab("feed");
    }
    
    // FIX для iOS
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.height = window.innerHeight + 'px';
      }, 300);
    }
  }

  // Запускаем инициализацию
  setTimeout(initApp, 300);

  // ===== FIX для iOS =====
  if (isIOS) {
    // Скрываем клавиатуру при тапе вне поля ввода
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('input, textarea, select')) {
        document.activeElement?.blur();
      }
    });
    
    // Прокручиваем поле ввода в видимую область
    document.addEventListener('focusin', function(e) {
      if (e.target.matches('input, textarea, select')) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  // ===== FIX для кнопок на iOS =====
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.97)';
      this.style.opacity = '0.9';
    }, { passive: true });
    
    btn.addEventListener('touchend', function() {
      this.style.transform = '';
      this.style.opacity = '1';
    }, { passive: true });
  });
});
