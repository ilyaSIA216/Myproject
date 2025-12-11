// В разделе "СОСТОЯНИЕ ПРИЛОЖЕНИЯ" добавляем:
let matchedUsers = []; // Список мэтчей
let currentChatId = null; // Текущий открытый чат
let chatMessages = {}; // Сообщения по чатам
let userReports = []; // Жалобы пользователя

// В список кандидатов добавляем для демо (после существующего массива candidates):
const demoMatches = [
  {
    id: 101,
    name: "Алексей",
    age: 28,
    gender: "male",
    city: "Москва",
    bio: "Дизайнер, люблю искусство и путешествия",
    photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
    interests: ["art", "travel", "photography"],
    matched_date: "2024-01-15",
    unread: 2
  },
  {
    id: 102,
    name: "Мария",
    age: 25,
    gender: "female",
    city: "Санкт-Петербург",
    bio: "Программист, увлекаюсь спортом и музыкой",
    photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
    verified: true,
    interests: ["sport", "music", "gaming"],
    matched_date: "2024-01-14",
    unread: 0
  }
];

// Демо сообщения для чатов:
const demoMessages = {
  101: [
    { id: 1, sender: 'other', text: 'Привет! Как дела?', time: '10:30', date: '2024-01-15' },
    { id: 2, sender: 'me', text: 'Привет! Всё отлично, а у тебя?', time: '10:32', date: '2024-01-15' },
    { id: 3, sender: 'other', text: 'Тоже хорошо! Вижу, ты любишь искусство?', time: '10:35', date: '2024-01-15' },
    { id: 4, sender: 'me', text: 'Да, очень! Часто хожу на выставки', time: '10:40', date: '2024-01-15' },
    { id: 5, sender: 'other', text: 'Круто! Может сходим вместе когда-нибудь?', time: '10:45', date: '2024-01-15' }
  ],
  102: [
    { id: 1, sender: 'me', text: 'Привет! Вижу, ты программист?', time: '14:20', date: '2024-01-14' },
    { id: 2, sender: 'other', text: 'Да! Занимаюсь веб-разработкой 3 года', time: '14:25', date: '2024-01-14' },
    { id: 3, sender: 'me', text: 'Круто! Я тоже в IT сфере', time: '14:30', date: '2024-01-14' },
    { id: 4, sender: 'other', text: 'Отлично! Есть о чём поговорить 😊', time: '14:35', date: '2024-01-14' }
  ]
};

// В функцию initApp() добавляем инициализацию чатов:
function initChatsSystem() {
  console.log('💬 Инициализирую систему чатов и жалоб');
  
  loadMatchedUsers();
  loadUserReports();
  
  // Если нет мэтчей, добавляем демо для тестирования
  if (matchedUsers.length === 0) {
    matchedUsers = demoMatches;
    saveMatchedUsers();
  }
  
  // Инициализируем демо сообщения
  Object.keys(demoMessages).forEach(chatId => {
    if (!chatMessages[chatId]) {
      chatMessages[chatId] = demoMessages[chatId];
    }
  });
  
  // Сохраняем сообщения
  saveChatMessages();
  
  updateChatsList();
}

// Загрузка мэтчей
function loadMatchedUsers() {
  try {
    const saved = localStorage.getItem("siamatch_matches");
    if (saved) {
      matchedUsers = JSON.parse(saved);
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки мэтчей:", e);
  }
}

// Сохранение мэтчей
function saveMatchedUsers() {
  try {
    localStorage.setItem("siamatch_matches", JSON.stringify(matchedUsers));
  } catch (e) {
    console.error("❌ Ошибка сохранения мэтчей:", e);
  }
}

// Загрузка сообщений
function loadChatMessages() {
  try {
    const saved = localStorage.getItem("siamatch_chat_messages");
    if (saved) {
      chatMessages = JSON.parse(saved);
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки сообщений:", e);
  }
}

// Сохранение сообщений
function saveChatMessages() {
  try {
    localStorage.setItem("siamatch_chat_messages", JSON.stringify(chatMessages));
  } catch (e) {
    console.error("❌ Ошибка сохранения сообщений:", e);
  }
}

// Загрузка жалоб
function loadUserReports() {
  try {
    const saved = localStorage.getItem("siamatch_user_reports");
    if (saved) {
      userReports = JSON.parse(saved);
    }
  } catch (e) {
    console.error("❌ Ошибка загрузки жалоб:", e);
  }
}

// Сохранение жалоб
function saveUserReports() {
  try {
    localStorage.setItem("siamatch_user_reports", JSON.stringify(userReports));
  } catch (e) {
    console.error("❌ Ошибка сохранения жалоб:", e);
  }
}

// Обновление списка чатов
function updateChatsList() {
  const chatsList = document.getElementById('chats-list');
  const chatsEmpty = document.getElementById('chats-empty');
  
  if (!chatsList || !chatsEmpty) return;
  
  chatsList.innerHTML = '';
  
  if (matchedUsers.length === 0) {
    chatsEmpty.classList.remove('hidden');
    return;
  }
  
  chatsEmpty.classList.add('hidden');
  
  matchedUsers.forEach(user => {
    const chatItem = document.createElement('li');
    chatItem.className = 'chat-item';
    chatItem.dataset.userId = user.id;
    chatItem.innerHTML = `
      <div class="chat-item-content">
        <img src="${user.photo}" alt="${user.name}" class="chat-user-photo" />
        <div class="chat-user-info">
          <div class="chat-user-name">${user.name}, ${user.age}</div>
          <div class="chat-user-last-message">${user.city} • ${user.interests.slice(0, 2).join(', ')}</div>
        </div>
        <div class="chat-meta">
          <div class="chat-time">${user.matched_date}</div>
          ${user.unread > 0 ? `<div class="chat-unread">${user.unread}</div>` : ''}
        </div>
      </div>
    `;
    
    chatItem.addEventListener('click', () => {
      openChat(user.id);
    });
    
    chatsList.appendChild(chatItem);
  });
}

// Открытие чата
function openChat(userId) {
  currentChatId = userId;
  
  const user = matchedUsers.find(u => u.id === parseInt(userId));
  if (!user) return;
  
  // Создаем экран чата если его нет
  if (!document.getElementById('chat-screen')) {
    createChatScreen();
  }
  
  // Показываем экран чата
  document.getElementById('screen-chats').classList.add('hidden');
  document.getElementById('chat-screen').classList.remove('hidden');
  document.getElementById('tab-bar').classList.add('hidden');
  
  // Устанавливаем информацию о собеседнике
  document.getElementById('chat-user-name').textContent = `${user.name}, ${user.age}`;
  document.getElementById('chat-user-city').textContent = user.city;
  document.getElementById('chat-user-photo').src = user.photo;
  document.getElementById('chat-user-bio').textContent = user.bio;
  
  // Загружаем сообщения
  loadMessagesForChat(userId);
  
  // Обнуляем непрочитанные
  user.unread = 0;
  saveMatchedUsers();
  updateChatsList();
}

// Создание экрана чата
function createChatScreen() {
  const chatScreen = document.createElement('div');
  chatScreen.id = 'chat-screen';
  chatScreen.className = 'screen hidden';
  chatScreen.innerHTML = `
    <div class="chat-header">
      <button id="back-to-chats" class="back-btn">←</button>
      <div class="chat-header-info">
        <img id="chat-user-photo" class="chat-header-photo" />
        <div>
          <div id="chat-user-name" class="chat-header-name"></div>
          <div id="chat-user-city" class="chat-header-status"></div>
        </div>
      </div>
      <button id="chat-report-btn" class="report-btn">⚠️</button>
    </div>
    
    <div class="chat-messages-container">
      <div class="chat-messages" id="chat-messages"></div>
    </div>
    
    <div class="chat-input-container">
      <input type="text" id="chat-message-input" placeholder="Напишите сообщение..." />
      <button id="send-message-btn" class="send-btn">➤</button>
    </div>
    
    <!-- Модальное окно жалобы -->
    <div id="report-modal" class="modal-overlay hidden">
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3>⚠️ Отправить жалобу</h3>
          <button class="close-btn" id="close-report-modal-btn">×</button>
        </div>
        <div id="report-modal-content">
          <div style="margin-bottom: 20px;">
            <div style="font-size: 14px; color: var(--muted); margin-bottom: 10px;">
              Жалоба на пользователя: <span id="report-user-name">-</span><br>
              Все сообщения из этого диалога будут скопированы в жалобу.
            </div>
            
            <div class="field">
              <label for="report-reason">Причина жалобы *</label>
              <select id="report-reason" class="filter-select" style="width: 100%;">
                <option value="">Выберите причину</option>
                <option value="spam">Спам, реклама</option>
                <option value="harassment">Оскорбления, харассмент</option>
                <option value="fake">Фейковая анкета</option>
                <option value="scam">Мошенничество</option>
                <option value="inappropriate">Неуместный контент</option>
                <option value="other">Другое</option>
              </select>
            </div>
            
            <div id="custom-report-reason" class="hidden">
              <div class="field">
                <label for="custom-reason-text">Опишите проблему подробно *</label>
                <textarea id="custom-reason-text" rows="3" placeholder="Опишите причину жалобы..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
              </div>
            </div>
            
            <div class="field">
              <label for="report-additional">Дополнительные комментарии (опционально)</label>
              <textarea id="report-additional" rows="2" placeholder="Любая дополнительная информация..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
            </div>
            
            <div class="field" style="margin-top: 15px;">
              <label style="color: var(--danger-red); font-size: 13px;">
                ⚠️ Внимание: После отправки жалобы диалог может быть заблокирован для проверки модератором.
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="submit-report-btn" class="primary danger-btn">Отправить жалобу</button>
            <button id="cancel-report-btn" class="secondary-btn">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('card').appendChild(chatScreen);
  
  // Инициализируем обработчики событий
  setupChatEventHandlers();
}

// Настройка обработчиков событий чата
function setupChatEventHandlers() {
  // Кнопка "Назад к чатам"
  document.getElementById('back-to-chats').addEventListener('click', () => {
    document.getElementById('chat-screen').classList.add('hidden');
    document.getElementById('screen-chats').classList.remove('hidden');
    document.getElementById('tab-bar').classList.remove('hidden');
    currentChatId = null;
  });
  
  // Кнопка отправки сообщения
  document.getElementById('send-message-btn').addEventListener('click', sendMessage);
  
  // Ввод сообщения по Enter
  document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Кнопка жалобы
  document.getElementById('chat-report-btn').addEventListener('click', openReportModal);
  
  // Закрытие модального окна жалобы
  document.getElementById('close-report-modal-btn').addEventListener('click', () => {
    document.getElementById('report-modal').classList.add('hidden');
  });
  
  // Отмена жалобы
  document.getElementById('cancel-report-btn').addEventListener('click', () => {
    document.getElementById('report-modal').classList.add('hidden');
  });
  
  // Выбор причины жалобы
  document.getElementById('report-reason').addEventListener('change', function() {
    const customReasonDiv = document.getElementById('custom-report-reason');
    if (this.value === 'other') {
      customReasonDiv.classList.remove('hidden');
    } else {
      customReasonDiv.classList.add('hidden');
    }
  });
  
  // Отправка жалобы
  document.getElementById('submit-report-btn').addEventListener('click', submitReport);
  
  // Закрытие модального окна при клике вне его
  document.getElementById('report-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('report-modal')) {
      document.getElementById('report-modal').classList.add('hidden');
    }
  });
}

// Загрузка сообщений для чата
function loadMessagesForChat(userId) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  messagesContainer.innerHTML = '';
  
  const messages = chatMessages[userId] || [];
  
  if (messages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="no-messages">
        <div class="no-messages-icon">💬</div>
        <div class="no-messages-text">Начните общение первым!</div>
      </div>
    `;
    return;
  }
  
  messages.forEach(msg => {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${msg.sender === 'me' ? 'message-out' : 'message-in'}`;
    messageElement.innerHTML = `
      <div class="message-content">${msg.text}</div>
      <div class="message-time">${msg.time}</div>
    `;
    messagesContainer.appendChild(messageElement);
  });
  
  // Прокрутка вниз
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

// Отправка сообщения
function sendMessage() {
  const input = document.getElementById('chat-message-input');
  const messageText = input.value.trim();
  
  if (!messageText || !currentChatId) return;
  
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toISOString().split('T')[0];
  
  const newMessage = {
    id: Date.now(),
    sender: 'me',
    text: messageText,
    time: timeString,
    date: dateString
  };
  
  // Добавляем сообщение в историю
  if (!chatMessages[currentChatId]) {
    chatMessages[currentChatId] = [];
  }
  
  chatMessages[currentChatId].push(newMessage);
  saveChatMessages();
  
  // Добавляем сообщение в интерфейс
  const messagesContainer = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'message message-out';
  messageElement.innerHTML = `
    <div class="message-content">${messageText}</div>
    <div class="message-time">${timeString}</div>
  `;
  messagesContainer.appendChild(messageElement);
  
  // Очищаем поле ввода
  input.value = '';
  
  // Прокрутка вниз
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
  
  // Симулируем ответ через 1-3 секунды
  setTimeout(() => {
    simulateResponse(currentChatId);
  }, 1000 + Math.random() * 2000);
}

// Симуляция ответа
function simulateResponse(chatId) {
  const responses = [
    "Интересно!",
    "Расскажи подробнее",
    "Согласен с тобой",
    "Как дела?",
    "Что нового?",
    "Понял тебя",
    "Спасибо за ответ!"
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toISOString().split('T')[0];
  
  const responseMessage = {
    id: Date.now(),
    sender: 'other',
    text: response,
    time: timeString,
    date: dateString
  };
  
  if (!chatMessages[chatId]) {
    chatMessages[chatId] = [];
  }
  
  chatMessages[chatId].push(responseMessage);
  saveChatMessages();
  
  // Если чат открыт, добавляем сообщение
  if (currentChatId === chatId) {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      const messageElement = document.createElement('div');
      messageElement.className = 'message message-in';
      messageElement.innerHTML = `
        <div class="message-content">${response}</div>
        <div class="message-time">${timeString}</div>
      `;
      messagesContainer.appendChild(messageElement);
      
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  } else {
    // Увеличиваем счетчик непрочитанных
    const user = matchedUsers.find(u => u.id === parseInt(chatId));
    if (user) {
      user.unread = (user.unread || 0) + 1;
      saveMatchedUsers();
      updateChatsList();
    }
  }
}

// Открытие модального окна жалобы
function openReportModal() {
  if (!currentChatId) return;
  
  const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
  if (!user) return;
  
  document.getElementById('report-user-name').textContent = `${user.name}, ${user.age}`;
  
  // Сброс формы
  document.getElementById('report-reason').value = '';
  document.getElementById('custom-report-reason').classList.add('hidden');
  document.getElementById('custom-reason-text').value = '';
  document.getElementById('report-additional').value = '';
  
  document.getElementById('report-modal').classList.remove('hidden');
}

// Отправка жалобы
function submitReport() {
  const reason = document.getElementById('report-reason').value;
  const customReason = document.getElementById('custom-reason-text').value;
  const additional = document.getElementById('report-additional').value;
  
  if (!reason) {
    showNotification('Выберите причину жалобы');
    return;
  }
  
  if (reason === 'other' && !customReason.trim()) {
    showNotification('Опишите причину жалобы');
    return;
  }
  
  const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
  if (!user) return;
  
  // Собираем данные для жалобы
  const reportData = {
    id: Date.now(),
    reporterId: profileData?.tg_id || 1,
    reporterName: profileData?.first_name || 'Пользователь',
    reportedUserId: user.id,
    reportedUserName: user.name,
    reason: reason === 'other' ? customReason : reason,
    additionalInfo: additional,
    chatMessages: chatMessages[currentChatId] || [],
    reporterProfile: profileData,
    reportedUserProfile: user,
    createdAt: new Date().toISOString(),
    status: 'pending',
    adminResponse: null
  };
  
  // Добавляем жалобу
  userReports.push(reportData);
  saveUserReports();
  
  // Сохраняем жалобу в localStorage для админ-панели
  saveReportToAdmin(reportData);
  
  // Показываем уведомление
  showNotification('✅ Жалоба отправлена!\n\nВаша жалоба будет рассмотрена администратором в течение 24 часов. Диалог сохранён для проверки.');
  
  // Закрываем модальное окно
  document.getElementById('report-modal').classList.add('hidden');
  
  if (tg?.HapticFeedback) {
    try {
      tg.HapticFeedback.impactOccurred('medium');
    } catch (e) {}
  }
}

// Сохранение жалобы для админ-панели
function saveReportToAdmin(reportData) {
  try {
    const existingReports = JSON.parse(localStorage.getItem('siamatch_admin_reports') || '[]');
    existingReports.push(reportData);
    localStorage.setItem('siamatch_admin_reports', JSON.stringify(existingReports));
  } catch (e) {
    console.error('❌ Ошибка сохранения жалобы для админа:', e);
  }
}

// В функции initApp() добавляем инициализацию чатов:
function initApp() {
  if (hasInitialized) return;
  hasInitialized = true;
  
  console.log('🎬 Инициализация приложения...');
  
  initTelegram();
  setupStartButton();
  setupTabButtons();
  
  // ... существующий код ...
  
  // Добавляем инициализацию чатов
  initChatsSystem();
  
  // ... остальной код ...
}

// В функции setActiveTab() обновляем обработку вкладки чатов:
function setActiveTab(tab) {
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id !== 'welcome-screen' && screen.id !== 'chat-screen') {
      screen.classList.add('hidden');
    }
  });
  
  // Скрываем экран чата если переключаемся на другую вкладку
  if (tab !== 'chats' && document.getElementById('chat-screen')) {
    document.getElementById('chat-screen').classList.add('hidden');
  }
  
  const screenId = 'screen-' + tab;
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  if (tab === 'feed') {
    initFeed();
  } else if (tab === 'profile') {
    initProfile();
  } else if (tab === 'filters') {
    initFiltersTab();
  } else if (tab === 'chats') {
    updateLikesUI();
    updateChatsList();
  }
  
  if (tabBar) {
    tabBar.classList.remove('hidden');
  }
  
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
}
