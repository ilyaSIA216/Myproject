// ===== SiaMatch app.js (анкета + лента знакомств) =====

// Аккуратная инициализация Telegram WebApp
let tg = null;
try {
  if (window.Telegram && Telegram.WebApp) {
    tg = Telegram.WebApp;
    tg.ready();
    tg.expand();
  }
} catch (e) {
  console.error("Telegram WebApp init error:", e);
}

// DOM-элементы
const usernameElem = document.getElementById("username");
const profileForm = document.getElementById("profile-form");
const mainBtn = document.getElementById("mainButton");

const feedBlock = document.getElementById("feed");
const candidatePhoto = document.getElementById("candidate-photo");
const candidateName = document.getElementById("candidate-name");
const candidateAge = document.getElementById("candidate-age");
const candidateCity = document.getElementById("candidate-city");
const candidateBio = document.getElementById("candidate-bio");
const btnLike = document.getElementById("btn-like");
const btnDislike = document.getElementById("btn-dislike");
const feedStatus = document.getElementById("feed-status");

// Пользователь Telegram
let user = null;
try {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    user = tg.initDataUnsafe.user;
  }
} catch (e) {
  console.error("Cannot read initDataUnsafe.user:", e);
}

// Приветствие
if (user) {
  const name = user.first_name || user.username || "друг";
  usernameElem.textContent = `Привет, ${name}!`;
} else {
  usernameElem.textContent = "Информация о пользователе недоступна.";
}

// Работа с localStorage
function loadProfileFromStorage() {
  try {
    const raw = localStorage.getItem("siamatch_profile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse profile from storage", e);
    return null;
  }
}

function saveProfileToStorage(profile) {
  try {
    localStorage.setItem("siamatch_profile", JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

// Мок-данные кандидатов (до подключения реального бэкенда)
const candidates = [
  {
    id: 1,
    name: "Алина",
    age: 24,
    city: "Москва",
    bio: "Люблю путешествия, кофе и долгие разговоры. Ищу человека с чувством юмора.",
    photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800"
  },
  {
    id: 2,
    name: "Дмитрий",
    age: 28,
    city: "Санкт-Петербург",
    bio: "Инженер, обожаю походы и настолки. Хочу встретить того, с кем будет уютно молчать.",
    photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&w=800"
  },
  {
    id: 3,
    name: "Екатерина",
    age: 26,
    city: "Казань",
    bio: "Фотограф, коты и книги — моя слабость. Давай знакомиться 🍀",
    photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800"
  }
];

let currentIndex = 0;
const likedIds = [];
const skippedIds = [];

// Показ кандидата
function showCurrentCandidate() {
  if (currentIndex >= candidates.length) {
    candidatePhoto.src = "";
    candidateName.textContent = "";
    candidateAge.textContent = "";
    candidateCity.textContent = "";
    candidateBio.textContent = "";
    feedStatus.textContent =
      likedIds.length > 0
        ? `На сегодня всё! Вы отметили лайком ${likedIds.length} человек(а).`
        : "На сегодня всё! Новые люди появятся позже.";
    btnLike.disabled = true;
    btnDislike.disabled = true;
    return;
  }

  const c = candidates[currentIndex];
  candidatePhoto.src = c.photo;
  candidateName.textContent = c.name;
  candidateAge.textContent = c.age;
  candidateCity.textContent = c.city;
  candidateBio.textContent = c.bio;
  feedStatus.textContent = "";
  btnLike.disabled = false;
  btnDislike.disabled = false;
}

// Обработчики лайка/скипа
function handleLike() {
  const c = candidates[currentIndex];
  likedIds.push(c.id);
  currentIndex += 1;
  showCurrentCandidate();
}

function handleDislike() {
  const c = candidates[currentIndex];
  skippedIds.push(c.id);
  currentIndex += 1;
  showCurrentCandidate();
}

btnLike.addEventListener("click", handleLike);
btnDislike.addEventListener("click", handleDislike);

// Настройка поведения кнопки и формы

function setupWithStoredProfile(profile) {
  profileForm.style.display = "block";
  document.getElementById("age").value = profile.age || "";
  document.getElementById("gender").value = profile.gender || "other";
  document.getElementById("bio").value = profile.bio || "";
  mainBtn.textContent = "Сохранить и перейти к знакомствам 🍀";
  mainBtn.onclick = () => saveProfile(true);
}

function setupInitial() {
  mainBtn.textContent = "Продолжить 🍀";
  mainBtn.onclick = () => {
    profileForm.style.display = "block";
    mainBtn.textContent = "Сохранить и перейти к знакомствам 🍀";
    mainBtn.onclick = () => saveProfile(true);
  };
}

// Проверяем, есть ли уже сохранённый профиль
const storedProfile = loadProfileFromStorage();
if (storedProfile) {
  setupWithStoredProfile(storedProfile);
} else {
  setupInitial();
}

// Сохранение профиля
function saveProfile(goToFeed = false) {
  const ageValue = Number(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const bio = document.getElementById("bio").value.trim();

  if (!ageValue || ageValue < 18 || ageValue > 99) {
    alert("Укажите возраст от 18 до 99 лет");
    return;
  }

  if (bio.length < 10) {
    alert("Напишите о себе хотя бы 10 символов");
    return;
  }

  const profileData = {
    tg_id: user ? user.id : null,
    first_name: user ? user.first_name : null,
    username: user ? user.username : null,
    age: ageValue,
    gender,
    bio
  };

  console.log("Profile data:", profileData);
  saveProfileToStorage(profileData);

  if (goToFeed) {
    // Переходим к ленте знакомств
    feedBlock.classList.remove("hidden");
    showCurrentCandidate();
    // Можно немного прокрутить, чтобы лента была видна
    profileForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  alert("Профиль сохранён! Можно переходить к знакомствам 🍀");
}
