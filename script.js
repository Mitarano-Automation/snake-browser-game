const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake;
let dir;
let nextDir;
let food;
let score;
let highscore = Number(localStorage.getItem('snake-highscore') || 0);
let gameOver;
let speed;
let loopId;

highscoreEl.textContent = highscore;

function reset() {
  snake = [{ x: 10, y: 10 }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  food = spawnFood();
  score = 0;
  speed = 130;
  gameOver = false;
  scoreEl.textContent = score;
  if (loopId) clearTimeout(loopId);
  tick();
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake?.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function tick() {
  if (gameOver) return render();

  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= tileCount || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver = true;
    render();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    speed = Math.max(70, speed - 3);
    scoreEl.textContent = score;
    if (score > highscore) {
      highscore = score;
      localStorage.setItem('snake-highscore', highscore);
      highscoreEl.textContent = highscore;
    }
    food = spawnFood();
  } else {
    snake.pop();
  }

  render();
  loopId = setTimeout(tick, speed);
}

function render() {
  ctx.fillStyle = '#0b0e1b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i <= tileCount; i++) {
    const p = i * gridSize;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke();
  }

  // food
  ctx.fillStyle = '#ff4f6d';
  ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

  // snake
  snake.forEach((seg, idx) => {
    ctx.fillStyle = idx === 0 ? '#9cff7a' : '#8ee36b';
    ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '16px system-ui';
    ctx.fillText('Drücke Start / Restart', canvas.width / 2, canvas.height / 2 + 24);
  }
}

function setDirection(x, y) {
  if (x === -dir.x && y === -dir.y) return;
  nextDir = { x, y };
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') setDirection(0, -1);
  if (key === 'arrowdown' || key === 's') setDirection(0, 1);
  if (key === 'arrowleft' || key === 'a') setDirection(-1, 0);
  if (key === 'arrowright' || key === 'd') setDirection(1, 0);
});

startBtn.addEventListener('click', reset);

render();
