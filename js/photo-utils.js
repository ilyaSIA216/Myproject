// ========== УТИЛИТЫ ДЛЯ РАБОТЫ С ФОТО ==========

// Глобальные переменные для фото
window.currentMainPhoto = null;
window.currentSelfie = null;

// Простое сохранение фото (без сложного сжатия)
function previewMainPhoto(event) {
    console.log('📸 Загрузка основного фото');
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Быстрая проверка
    if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 10MB)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('main-photo-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        window.currentMainPhoto = e.target.result;
        console.log('✅ Основное фото загружено');
    };
    reader.readAsDataURL(file);
}

function previewSelfie(event) {
    console.log('🤳 Загрузка селфи');
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Быстрая проверка
    if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой (максимум 10MB)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('selfie-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        window.currentSelfie = e.target.result;
        console.log('✅ Селфи загружено');
    };
    reader.readAsDataURL(file);
}

// Экспортируем
window.previewMainPhoto = previewMainPhoto;
window.previewSelfie = previewSelfie;
