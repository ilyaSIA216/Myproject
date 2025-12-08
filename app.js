// ==== ТЕСТОВЫЙ ВАРИАНТ app.js БЕЗ TELEGRAM API ====

// Берём элементы из DOM
const usernameElem = document.getElementById("username");
const profileForm = document.getElementById("profile-form");
const mainBtn = document.getElementById("mainButton");

// Просто проверяем, что скрипт подгрузился
console.log("app.js loaded");
alert("app.js загружен (тестовый режим)");

// Меняем текст приветствия
usernameElem.textContent = "Тест без Telegram API";

// Простейший обработчик кнопки
mainBtn.onclick = () => {
  alert("Кнопка работает, JS исполняется");

  // Для наглядности покажем форму
  profileForm.style.display = "block";
  mainBtn.textContent = "Сохранить профиль (тест)";
};
