// ui.js - Уведомления, модальные окна и UI компоненты

export const ui = {
  // Уведомления
  showNotification(message) {
    const notification = document.createElement('div');
    const style = document.createElement('style');
    
    notification.className = 'notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px 25px;
      border-radius: 15px;
      z-index: 9999;
      text-align: center;
      max-width: 80%;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.3s ease;
    `;
    
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -40%); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
    
    notification.addEventListener('click', () => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    });
  },
  
  // Модальное окно
  showModal({ title, content, buttons = [] }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    let buttonsHTML = '';
    if (buttons.length > 0) {
      buttonsHTML = `<div class="modal-actions">${buttons.map(btn => `
        <button class="${btn.class || 'secondary-btn'}" 
                data-action="${btn.action || 'close'}">
          ${btn.text}
        </button>
      `).join('')}</div>`;
    }
    
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="close-btn" data-action="close">×</button>
        </div>
        <div style="padding: 20px;">
          ${content}
          ${buttonsHTML}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики закрытия
    const closeHandler = (e) => {
      if (e.target === modal || e.target.dataset.action === 'close') {
        modal.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
          if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
          }
        }, 300);
      }
    };
    
    modal.addEventListener('click', closeHandler);
    
    // Добавляем стили анимации
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    return modal;
  },
  
  // Загрузка
  showLoader(text = 'Загрузка...') {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">${text}</div>
      </div>
    `;
    
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
    `;
    
    document.body.appendChild(loader);
    return loader;
  },
  
  hideLoader(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  },
  
  // Toast сообщение
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9998;
      animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
    
    // Добавляем стили если их нет
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(0); opacity: 1; }
          to { transform: translateX(-50%) translateY(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
};
