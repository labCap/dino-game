const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// variables
let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let startGame = false;

// event listner
document.addEventListener("keydown", (evt) => {
  keys[evt.code] = true;
});

document.addEventListener("keyup", (evt) => {
  keys[evt.code] = false;
});

class Player {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dy = 0;
    this.jumpForce = 15;
    this.originalHeight = h;
    this.grounded = false;
    this.jampTimer = 0;
  }

  Animate() {
    // jamp
    if (keys["Space"] || keys["KeyW"]) {
      this.Jamp();
    } else {
      this.jampTimer = 0;
    }

    if (keys["ShiftLeft"] || keys["KeyS"]) {
      this.h = this.originalHeight / 2;
    } else {
      this.h = this.originalHeight;
    }

    this.y += this.dy;

    // Gravity
    if (this.y + this.h < canvas.height) {
      this.dy += gravity;
      this.grounded = false;
    } else {
      this.dy = 0;
      this.grounded = true;
      this.y = canvas.height - this.h;
    }

    this.Draw();
  }

  Jamp() {
    if (this.grounded && this.jampTimer == 0) {
      this.jampTimer = 1;
      this.dy = -this.jumpForce;
    } else if (this.jampTimer > 0 && this.jampTimer < 15) {
      this.jampTimer++;
      this.dy = -this.jumpForce - this.jampTimer / 50;
    }
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Obstacle {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = c;

    this.dx = -gameSpeed;
  }

  Update() {
    this.x += this.dx;
    this.Draw();
    this.dx = -gameSpeed;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.closePath();
  }
}

class Text {
  constructor(t, x, y, a, c, s) {
    this.t = t;
    this.x = x;
    this.y = y;
    this.a = a;
    this.c = c;
    this.s = s;
  }

  Draw() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.font = `${this.s}px sans-serif`;
    ctx.textAlign = this.a;
    ctx.fillText(this.t, this.x, this.y);
    ctx.closePath();
  }
}

// game functions
function SpawnObstacle() {
  let size = RandomIntInRange(20, 70);
  let type = RandomIntInRange(0, 1);
  let obstacle = new Obstacle(
    canvas.width + size,
    canvas.height - size,
    size,
    size,
    "#2484E4"
  );

  if (type == 1) {
    obstacle.y -= player.originalHeight - 10;
  }

  obstacles.push(obstacle);
}

function RandomIntInRange(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

// SpawnObstacle();

function Start() {
  canvas.width = canvas.width;
  canvas.height = canvas.height;

  ctx.font = "20px sans-serif";

  gameSpeed = 3;
  gravity = 1;

  score = 0;
  highscore = 0;
  if (localStorage.getItem("highscore")) {
    highscore = localStorage.getItem("highscore");
  }

  player = new Player(25, canvas.height - 150, 50, 50, "#ff5858");

  scoreText = new Text(`Score: ${score}`, 25, 25, "left", "#fff", "20");
  highscoreText = new Text(
    `highscore: ${highscore}`,
    25,
    55,
    "left",
    "#fff",
    "20"
  );

  requestAnimationFrame(Update);
}

let initialSpawnTimer = 150;
let spawnTimer = initialSpawnTimer;

function Update() {
  requestAnimationFrame(Update);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  spawnTimer--;
  if (spawnTimer <= 0) {
    SpawnObstacle();
    spawnTimer = initialSpawnTimer - gameSpeed * 8;

    if (spawnTimer < 60) {
      spawnTimer = 60;
    }
  }

  // spawn enemies
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];

    if (o.x + o.w < 0) {
      obstacles.splice(i, 1);
    }

    if (
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ) {
      obstacles = [];
      score = 0;
      spawnTimer = initialSpawnTimer;
      gameSpeed = 3;
      window.localStorage.setItem("highscore", highscore / 100);
    }

    o.Update();
  }

  player.Animate();

  scoreText.t = `Score: ${score++ / 100}`;
  scoreText.Draw();

  if (score > highscore) {
    highscore = score;
    highscoreText.t = `Highscore: ${highscore / 100}`;
    window.localStorage.setItem("highscore", highscore / 100);
  }

  highscoreText.Draw();

  gameSpeed += 0.003;
}

function Before() {
  beforeText = new Text(
    `Натисніть Enter щоб почати`,
    canvas.width / 2,
    canvas.height / 2,
    "center",
    "#fff",
    "20"
  );
  beforeText.Draw();
}

Before();

document.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    Start();
  }
});
