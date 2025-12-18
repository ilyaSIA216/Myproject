// ===== UTILS/SWIPE.JS — ТОЛЬКО ФУНКЦИИ (0 ПЕРЕМЕННЫХ) =====

function initSwipeSystem() {
  console.log('👆 Tinder свайпы готовы');
  const card = document.getElementById('profileCard');
  if (!card) return;
  
  card.addEventListener('touchstart', handleTouchStart, { passive: true });
  card.addEventListener('touchmove', handleTouchMove, { passive: false });
  card.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  card.addEventListener('mousedown', handleMouseDown);
  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseup', handleMouseEnd);
  card.addEventListener('mouseleave', handleMouseLeave);
}

function handleTouchStart(e) {
  window.swipeStartX = e.touches[0].clientX;
  window.swipeStartY = e.touches[0].clientY;
  window.isSwiping = false;
  document.getElementById('profileCard').style.transition = 'none';
}

function handleTouchMove(e) {
  if (!window.swipeStartX || !window.swipeStartY) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - window.swipeStartX;
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
    window.isSwiping = true;
    const card = document.getElementById('profileCard');
    const opacity = 1 - Math.abs(deltaX) / 300;
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    card.style.opacity = Math.max(opacity, 0.5);
    
    if (deltaX > 50) showSwipeFeedback('like');
    else if (deltaX < -50) showSwipeFeedback('dislike');
  }
}

function handleTouchEnd(e) {
  const deltaX = e.changedTouches[0].clientX - window.swipeStartX;
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  
  if (window.isSwiping && Math.abs(deltaX) > 100) {
    deltaX > 0 ? handleSwipeRight() : handleSwipeLeft();
  } else {
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = '1';
  }
  window.swipeStartX = 0; window.swipeStartY = 0; window.isSwiping = false;
}

function handleMouseDown(e) {
  window.swipeStartX = e.clientX; window.swipeStartY = e.clientY;
  document.getElementById('profileCard').style.transition = 'none';
}

function handleSwipeRight() { showSwipeAnimation('right'); setTimeout(handleLike, 300); }
function handleSwipeLeft() { showSwipeAnimation('left'); setTimeout(handleDislike, 300); }

function handleLike() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  if (typeof likedIds !== 'undefined') likedIds.push(window.currentCandidateId);
  setTimeout(() => { window.currentIndex++; showCurrentCandidate(); }, 400);
}

function handleDislike() {
  setTimeout(() => { window.currentIndex++; showCurrentCandidate(); }, 400);
}

function showSwipeAnimation(direction) {
  const card = document.getElementById('profileCard');
  if (card) {
    card.classList.add(`swipe-${direction}`);
    setTimeout(() => card.classList.remove('swipe-left', 'swipe-right'), 500);
  }
}

function showSwipeFeedback(type) {
  const f = document.createElement('div');
  f.textContent = type === 'like' ? '❤️' : '❌';
  f.style.cssText = 'position:fixed;font-size:80px;z-index:200;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0;transition:all .3s';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

window.SwipeUtils = { init: initSwipeSystem };
