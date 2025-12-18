class SiaMatchApp {
  constructor() { this.init(); }
  
  init() {
    console.log('🍀 SiaMatch готов!');
    setTimeout(() => {
      document.querySelector('.loading-screen').classList.remove('active');
      document.querySelector('.main-content').style.display = 'block';
      if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
    }, 1500);
    
    this.bindEvents();
  }
  
  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const tab = e.target.dataset.tab;
        document.getElementById('screen-'+tab)?.classList.add('active');
        e.target.classList.add('active');
        if (tab === 'feed') showCurrentCandidate?.();
      };
    });
    
    document.getElementById('likeBtn').onclick = handleLike;
    document.getElementById('dislikeBtn').onclick = handleDislike;
  }
}

document.addEventListener('DOMContentLoaded', () => new SiaMatchApp());
