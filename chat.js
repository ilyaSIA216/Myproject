// chat.js - Система чатов, сообщений и жалоб
import { appState } from './core.js';

// Состояние чатов
let matchedUsers = [];
let currentChatId = null;
let chatMessages = {};
let userReports = [];

export const chatSystem = {
  init() {
    console.log('💬 Инициализирую систему чатов и жалоб');
    this.loadMatchedUsers();
    this.loadChatMessages();
    this.loadUserReports();
    this.setupChatEventHandlers();
    this.updateChatsList();
  },
  
  loadMatchedUsers() {
    try {
      const saved = localStorage.getItem("siamatch_matches");
      if (saved) {
        matchedUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки мэтчей:", e);
    }
  },
  
  saveMatchedUsers() {
    try {
      localStorage.setItem("siamatch_matches", JSON.stringify(matchedUsers));
    } catch (e) {
      console.error("❌ Ошибка сохранения мэтчей:", e);
    }
  },
  
  loadChatMessages() {
    try {
      const saved = localStorage.getItem("siamatch_chat_messages");
      if (saved) {
        chatMessages = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки сообщений:", e);
    }
  },
  
  saveChatMessages() {
    try {
      localStorage.setItem("siamatch_chat_messages", JSON.stringify(chatMessages));
    } catch (e) {
      console.error("❌ Ошибка сохранения сообщений:", e);
    }
  },
  
  loadUserReports() {
    try {
      const saved = localStorage.getItem("siamatch_user_reports");
      if (saved) {
        userReports = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки жалоб:", e);
    }
  },
  
  saveUserReports() {
    try {
      localStorage.setItem("siamatch_user_reports", JSON.stringify(userReports));
    } catch (e) {
      console.error("❌ Ошибка сохранения жалоб:", e);
    }
  },
  
  updateChatsList() {
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
        this.openChat(user.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  },
  
  openChat(userId) {
    currentChatId = userId;
    
    const user = matchedUsers.find(u => u.id === parseInt(userId));
    if (!user) return;
    
    if (!document.getElementById('chat-screen')) {
      this.createChatScreen();
    }
    
    document.getElementById('screen-chats').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('hidden');
    
    document.getElementById('chat-user-name').textContent = `${user.name}, ${user.age}`;
    document.getElementById('chat-user-city').textContent = user.city;
    document.getElementById('chat-user-photo').src = user.photo;
    document.getElementById('chat-user-bio').textContent = user.bio;
    
    this.loadMessagesForChat(userId);
    
    user.unread = 0;
    this.saveMatchedUsers();
    this.updateChatsList();
  },
  
  createChatScreen() {
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
    `;
    
    document.getElementById('card').appendChild(chatScreen);
  },
  
  setupChatEventHandlers() {
    document.getElementById('back-to-chats')?.addEventListener('click', () => {
      document.getElementById('chat-screen').classList.add('hidden');
      document.getElementById('screen-chats').classList.remove('hidden');
      document.getElementById('tab-bar').classList.remove('hidden');
      currentChatId = null;
    });
    
    document.getElementById('send-message-btn')?.addEventListener('click', () => {
      this.sendMessage();
    });
    
    document.getElementById('chat-message-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    document.getElementById('chat-report-btn')?.addEventListener('click', () => {
      this.openReportModal();
    });
  },
  
  loadMessagesForChat(userId) {
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
    
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  },
  
  sendMessage() {
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
    
    if (!chatMessages[currentChatId]) {
      chatMessages[currentChatId] = [];
    }
    
    chatMessages[currentChatId].push(newMessage);
    this.saveChatMessages();
    
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-out';
    messageElement.innerHTML = `
      <div class="message-content">${messageText}</div>
      <div class="message-time">${timeString}</div>
    `;
    messagesContainer.appendChild(messageElement);
    
    input.value = '';
    
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  },
  
  openReportModal() {
    // Реализация модального окна жалобы
    console.log('Открытие модального окна жалобы');
  }
};
