// ===== SWIPE.JS — ТОЛЬКО ФУНКЦИИ =====
function initSwipeSystem() {
  const card = document.getElementById('profileCard');
  if (!card) return;
  
  card.ontouchstart = (e) => {
    window.swipeStartX = e.touches[0].clientX;
    window.swipeStartY = e.touches[0].clientY;
    window.isSwiping = false;
    card.style.transition = 'none';
  };
  
  card.ontouchmove = (e) => {
    if (!window.swipeStartX) return;
    const deltaX = e.touches[0].clientX - window.swipeStartX;
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      window.isSwiping = true;
      card.style.transform = `translateX(${deltaX}px) rotate(${deltaX*0.1}deg)`;
      card.style.opacity = Math.max(1-Math.abs(deltaX)/300, 0.5);
    }
  };
  
  card.ontouchend = (e) => {
    const deltaX = e.changedTouches[0].clientX - window.swipeStartX;
    card.style.transition = 'all 0.4s ease';
    if (window.isSwiping && Math.abs(deltaX) > 100) {
      deltaX > 0 ? handleSwipeRight() : handleSwipeLeft();
    } else {
      card.style.transform = 'translateX(0) rotate(0deg)';
      card.style.opacity = '1';
    }
    window.swipeStartX = 0; window.isSwiping = false;
  };
}

function handleSwipeRight() { 
  showSwipeAnimation('right'); 
  setTimeout(handleLike, 300); 
}

function handleSwipeLeft() { 
  showSwipeAnimation('left'); 
  setTimeout(handleDislike, 300); 
}

function handleLike() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  setTimeout(() => { 
    if (typeof currentIndex !== 'undefined') currentIndex++; 
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate(); 
  }, 400);
}

function handleDislike() {
  setTimeout(() => { 
    if (typeof currentIndex !== 'undefined') currentIndex++; 
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate(); 
  }, 400);
}

function showSwipeAnimation(direction) {
  const card = document.getElementById('profileCard');
  if (card) {
    card.classList.add('swipe-'+direction);
    setTimeout(() => card.classList.remove('swipe-left','swipe-right'), 500);
  }
}

window.SwipeUtils = { init: initSwipeSystem };
