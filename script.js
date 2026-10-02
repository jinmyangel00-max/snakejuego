const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

let score = 0;
let high = Number(localStorage.getItem('highScore')) || 0;
let running = false;
let animationFrameId = null;
let asteroids = [];
let stars = [];
const ship = { x: 240, y: 560, w: 30, h: 30, speed: 6 };
const keys = {};

highEl.textContent = 'Récord: ' + high;

function createStars() {
  stars = [];
  for (let i = 0; i < 60; i++) {
    stars.push({ x: Math.random() * 480, y: Math.random() * 640, r: Math.random() * 2 });
  }
}

createStars();

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// Controles táctiles
canvas.addEventListener('touchmove', e => {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0];
  ship.x = (t.clientX - rect.left) * (canvas.width / rect.width) - ship.w / 2;
  e.preventDefault();
}, { passive: false });

function spawnAsteroid() {
  const size = 20 + Math.random() * 30;
  asteroids.push({
    x: Math.random() * (480 - size),
    y: -size,
    w: size, h: size,
    speed: 2 + Math.random() * 3 + score / 200,
    rot: Math.random() * Math.PI
  });
}

function update() {
  if (keys['arrowleft'] || keys['a']) ship.x -= ship.speed;
  if (keys['arrowright'] || keys['d']) ship.x += ship.speed;
  ship.x = Math.max(0, Math.min(480 - ship.w, ship.x));

  if (Math.random() < 0.03 + score / 5000) spawnAsteroid();

  stars.forEach(s => { s.y += 1; if (s.y > 640) { s.y = 0; s.x = Math.random() * 480; } });

  asteroids.forEach(a => { a.y += a.speed; a.rot += 0.02; });
  asteroids = asteroids.filter(a => a.y < 700);

  for (const a of asteroids) {
    if (ship.x < a.x + a.w && ship.x + ship.w > a.x &&
        ship.y < a.y + a.h && ship.y + ship.h > a.y) {
      gameOver();
      return;
    }
  }

  score++;
  scoreEl.textContent = 'Puntos: ' + score;
}

function draw() {
  ctx.clearRect(0, 0, 480, 640);

  ctx.fillStyle = '#fff';
  stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill(); });

  // Nave
  ctx.save();
  ctx.translate(ship.x + ship.w / 2, ship.y + ship.h / 2);
  ctx.fillStyle = '#6cf';
  ctx.beginPath();
  ctx.moveTo(0, -15); ctx.lineTo(14, 14); ctx.lineTo(-14, 14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fc6';
  ctx.beginPath();
  ctx.moveTo(-5, 16); ctx.lineTo(0, 26 + Math.random() * 6); ctx.lineTo(5, 16);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // Asteroides
  asteroids.forEach(a => {
    ctx.save();
    ctx.translate(a.x + a.w / 2, a.y + a.h / 2);
    ctx.rotate(a.rot);
    ctx.fillStyle = '#a77';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const ang = i / 8 * Math.PI * 2;
      const rad = (a.w / 2) * (0.7 + Math.random() * 0.3);
      ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  });
}

function loop() {
  if (!running) return;
  update();
  draw();
  animationFrameId = requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (score > high) {
    high = score;
    localStorage.setItem('highScore', String(high));
    highEl.textContent = 'Récord: ' + high;
  }

  overlay.querySelector('h1').textContent = '💥 ¡Fin del juego!';
  overlay.querySelector('p').textContent = 'Puntuación: ' + score + ' puntos. ¡Inténtalo de nuevo!';
  startBtn.textContent = 'Reintentar';
  overlay.classList.remove('hidden');
}

function startGame() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  score = 0;
  asteroids = [];
  ship.x = 240;
  scoreEl.textContent = 'Puntos: 0';
  overlay.classList.add('hidden');
  running = true;
  draw();
  animationFrameId = requestAnimationFrame(loop);
}

startBtn.addEventListener('click', startGame);
