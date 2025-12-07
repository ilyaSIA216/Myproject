// ========== ЛОГИКА РЕГИСТРАЦИИ SiaMatch ==========

// Данные пользователя
let userProfile = {
    name: '',
    age: '',
    city: '',
    mainPhoto: '',
    selfie: '',
    gender: ''
};

// Простые уведомления
function showNotification(message) {
    alert(message);
}

// Переход между шагами
function goToStep(stepNumber) {
    console.log(`➡️ Переход к шагу ${stepNumber}`);
    
    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Показываем нужный шаг
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (stepElement) {
        stepElement.classList.remove('hidden');
        
        // Обновляем прогресс
        const progressDots = document.querySelectorAll('.progress-indicator .step-dot');
        progressDots.forEach((dot, index) => {
            if (index < stepNumber) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    window.scrollTo(0, 0);
}

// ========== ШАГ 1: ИМЯ ==========

function startOnboarding() {
    console.log('🚀 Начало регистрации');
    goToStep(1);
}

function saveName() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    
    if (!name || name.length < 2) {
        showNotification('Введите имя (минимум 2 буквы)');
        return;
    }
    
    userProfile.name = name;
    goToStep(2);
}

// ========== ШАГ 2: ПОЛ ==========

function selectGender(gender) {
    document.querySelectorAll('.gender-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (gender === 'male') {
        document.querySelector('.gender-option:nth-child(1)').classList.add('selected');
    } else {
        document.querySelector('.gender-option:nth-child(2)').classList.add('selected');
    }
    
    userProfile.gender = gender;
}

function saveGender() {
    if (!userProfile.gender) {
        showNotification('Выберите ваш пол');
        return;
    }
    goToStep(3);
}

// ========== ШАГ 3: ВОЗРАСТ ==========

function initAgeSelect() {
    const ageSelect = document.getElementById('age-select');
    if (!ageSelect) return;
    
    while (ageSelect.options.length > 1) {
        ageSelect.remove(1);
    }
    
    for (let age = 18; age <= 60; age++) {
        const option = document.createElement('option');
        option.value = age;
        option.textContent = `${age} лет`;
        ageSelect.appendChild(option);
    }
}

function saveAge() {
    const ageSelect = document.getElementById('age-select');
    const age = ageSelect.value;
    
    if (!age) {
        showNotification('Выберите возраст');
        return;
    }
    
    userProfile.age = parseInt(age);
    goToStep(4);
}

// ========== ШАГ 4: ГОРОД ==========

function initCitySelect() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
    
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    // Простые города
    const cities = [
        "Москва", "Санкт-Петербург", "Казань", "Новосибирск", 
        "Екатеринбург", "Нижний Новгород", "Самара", "Челябинск",
        "Ростов-на-Дону", "Уфа", "Краснодар", "Воронеж"
    ];
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

function saveCity() {
    const citySelect = document.getElementById('city-select');
    const city = citySelect.value;
    
    if (!city) {
        showNotification('Выберите город');
        return;
    }
    
    userProfile.city = city;
    goToStep(5);
}

// ========== ШАГ 5: ФОТО ==========

function saveMainPhoto() {
    console.log('💾 Проверка основного фото');
    console.log('Текущее фото:', window.currentMainPhoto ? 'загружено' : 'нет');
    
    if (!window.currentMainPhoto) {
        showNotification('Загрузите ваше фото');
        return;
    }
    
    userProfile.mainPhoto = window.currentMainPhoto;
    console.log('✅ Основное фото сохранено');
    goToStep(6);
}

// ========== ШАГ 6: СЕЛФИ ==========

function saveSelfie() {
    console.log('💾 Проверка селфи');
    console.log('Текущее селфи:', window.currentSelfie ? 'загружено' : 'нет');
    
    if (!window.currentSelfie) {
        showNotification('Сделайте селфи для подтверждения');
        return;
    }
    
    if (!window.currentMainPhoto) {
        showNotification('Сначала загрузите основное фото');
        return;
    }
    
    userProfile.selfie = window.currentSelfie;
    
    // Проверяем все данные
    if (!userProfile.name || !userProfile.age || !userProfile.city || !userProfile.gender) {
        showNotification('Заполните все поля');
        return;
    }
    
    // Добавляем ID и дату
    userProfile.id = Date.now();
    userProfile.submittedAt = new Date().toISOString();
    userProfile.applicationId = 'APP-' + userProfile.id.toString().slice(-6);
    userProfile.status = 'pending';
    
    console.log('📤 Отправка данных:', userProfile);
    
    // Блокируем кнопку
    const submitBtn = document.querySelector('#step-6 .btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
    }
    
    // Отправляем на модерацию
    try {
        // Используем существующую функцию или создаем простую
        if (typeof submitForModeration === 'function') {
            const result = submitForModeration(userProfile);
            console.log('✅ Функция submitForModeration вызвана, результат:', result);
        } else {
            // Простая версия если функция не найдена
            simpleSubmit(userProfile);
        }
        
        // Переходим к ожиданию
        setTimeout(() => {
            goToStep(7);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Отправить на проверку';
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        showNotification('Ошибка отправки. Попробуйте снова.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить на проверку';
        }
    }
}

// Простая функция отправки
function simpleSubmit(userData) {
    console.log('📝 Простая отправка данных');
    
    // Сохраняем в localStorage
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored) {
            pendingUsers = JSON.parse(stored);
        }
    } catch (e) {
        console.log('⚠️ Ошибка чтения данных, создаем новый список');
    }
    
    // Очищаем фото для экономии места (сохраняем только флаги)
    const userForStorage = {
        id: userData.id,
        name: userData.name,
        age: userData.age,
        city: userData.city,
        gender: userData.gender,
        status: 'pending',
        submittedAt: userData.submittedAt,
        applicationId: userData.applicationId,
        hasMainPhoto: !!userData.mainPhoto,
        hasSelfie: !!userData.selfie
    };
    
    pendingUsers.push(userForStorage);
    
    // Сохраняем фото отдельно
    if (userData.mainPhoto) {
        localStorage.setItem(`sia_photo_${userData.id}_main`, userData.mainPhoto);
    }
    if (userData.selfie) {
        localStorage.setItem(`sia_photo_${userData.id}_selfie`, userData.selfie);
    }
    
    // Сохраняем основной список
    localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
    localStorage.setItem('sia_current_user_id', userData.id.toString());
    
    console.log('✅ Данные сохранены. Всего заявок:', pendingUsers.length);
    return userData.id;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Auth.js загружен');
    initAgeSelect();
    initCitySelect();
});

// Экспортируем функции для HTML
window.startOnboarding = startOnboarding;
window.selectGender = selectGender;
window.saveName = saveName;
window.saveGender = saveGender;
window.saveAge = saveAge;
window.saveCity = saveCity;
window.saveMainPhoto = saveMainPhoto;
window.saveSelfie = saveSelfie;
window.goToStep = goToStep;
