// ФУНКЦИИ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ

// Проверка мобильного устройства
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Оптимизация для мобильных
function optimizeForMobile() {
    if (!isMobileDevice()) return;

    // Уменьшаем время анимации
    document.documentElement.style.setProperty('--transition-speed', '0.2s');
    
    // Увеличиваем размер кнопок для мобильных
    const buttons = document.querySelectorAll('.btn, .back-btn, .gender-option');
    buttons.forEach(btn => {
        btn.style.minHeight = '44px';
        btn.style.minWidth = '44px';
    });
    
    // Увеличиваем размер полей ввода
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.fontSize = '16px'; // Предотвращаем зумирование в iOS
    });
}

// Обработка событий для мобильных
function setupMobileEvents() {
    if (!isMobileDevice()) return;

    // Предотвращаем двойной тап
    let lastTap = 0;
    document.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    // Улучшаем обратную связь для тапов
    document.addEventListener('touchstart', function() {}, {passive: true});
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    optimizeForMobile();
    setupMobileEvents();
});

// Экспортируем функции
window.isMobileDevice = isMobileDevice;
window.optimizeForMobile = optimizeForMobile;
