import './style.css';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

const $score = document.querySelector('span');
const $highScore = document.querySelector('#highScore');
const tetrisMusic = document.getElementById('tetrisMusic');
tetrisMusic.volume = 0.1;
const gameOverSound = document.getElementById('gameOverSound');
const rowRemovedSound = document.getElementById('rowRemovedSound');
const piecePlacedSound = document.getElementById('piecePlacedSound');
const muteButton = document.getElementById('muteButton');
const volumeControl = document.getElementById('volumeControl');

let isMuted = false;

muteButton.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    tetrisMusic.pause();
    gameOverSound.muted = true;
    rowRemovedSound.muted = true;
    piecePlacedSound.muted = true;
  } else {
    tetrisMusic.play();
    gameOverSound.muted = false;
    rowRemovedSound.muted = false;
    piecePlacedSound.muted = false;
  }
});

volumeControl.addEventListener('input', () => {
  const volume = volumeControl.value;
  tetrisMusic.volume = volume;
  gameOverSound.volume = volume;
  rowRemovedSound.volume = volume;
  piecePlacedSound.volume = volume;
});

function playPiecePlacedSound() {
  if (!isMuted) {
    piecePlacedSound.currentTime = 0;
    piecePlacedSound.play();
  }
}

function playGameOverSound() {
  if (!isMuted) {
    gameOverSound.play();
  }
}

function playRowRemovedSound() {
  if (!isMuted) {
    rowRemovedSound.play();
  }
}

let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;

let gamePaused = false;
let gameRunning = false;
let dropCounter = 0;
let lastTime = 0;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

const board = Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => 0));

const piece = {
  position: { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 },
  shape: [
    [1, 1],
    [1, 1]
  ]
};

const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1]
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [0, 1],
    [0, 1],
    [1, 1]
  ]
];

function update(time = 0) {
  if (!gamePaused) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > 400) {
      piece.position.y++;
      dropCounter = 0;

      if (checkCollision()) {
        piece.position.y--;
        solidifyPiece();
        removeRows();
      }
    }

    draw();
    if (gameRunning) {
      window.requestAnimationFrame(update);
    }
  }
}


function calculateGhostPiecePosition() {
  let ghostPosition = { ...piece.position };
  while (!checkCollisionGhost(ghostPosition)) {
    ghostPosition.y++;
  }
  ghostPosition.y--;
  return ghostPosition;
}

function checkCollisionGhost(ghostPosition) {
  return piece.shape.some((row, y) =>
    row.some((value, x) =>
      value !== 0 && (
        board[y + ghostPosition.y]?.[x + ghostPosition.x] !== 0 ||
        x + ghostPosition.x < 0 ||
        x + ghostPosition.x >= BOARD_WIDTH ||
        y + ghostPosition.y >= BOARD_HEIGHT
      )
    )
  );
}

function draw() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (board[y][x] !== 0) {
        context.fillStyle = '#003';
        context.fillRect(x, y, 1, 1);
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.fillRect(x, y, 1, 1);
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(x + 0.9, y, 0.1, 1);
        context.fillRect(x, y + 0.9, 1, 0.1);
      }
    }
  }

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = getPieceColor(piece.shape);
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
        context.fillStyle = 'rgba(255, 255, 255, 0)';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(x + piece.position.x + 0.9, y + piece.position.y, 0.1, 1);
        context.fillRect(x + piece.position.x, y + piece.position.y + 0.9, 1, 0.1);
      }
    });
  });

  const ghostPosition = calculateGhostPiecePosition();
  context.globalAlpha = 0.3;
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = getPieceColor(piece.shape);
        context.fillRect(x + ghostPosition.x, y + ghostPosition.y, 1, 1);
      }
    });
  });
  context.globalAlpha = 1;

  $score.innerText = score;
  $highScore.innerText = highScore;
}

function getPieceColor(pieceShape) {
  for (let i = 0; i < PIECES.length; i++) {
    for (let j = 0; j < 4; j++) {
      if (arraysMatch(PIECES[i], pieceShape)) {
        switch (i) {
          case 0:
            return 'cyan';
          case 1:
            return 'yellow';
          case 2:
            return 'purple';
          case 3:
            return 'green';
          case 4:
            return 'red';
          case 5:
            return 'blue';
          case 6:
            return 'orange';
        }
      }
      pieceShape = rotatePiece(pieceShape);
    }
  }
  return 'white';
}

function rotatePiece(pieceShape) {
  const rotatedPiece = [];
  const rows = pieceShape.length;
  const cols = pieceShape[0].length;
  for (let i = 0; i < cols; i++) {
    rotatedPiece.push([]);
    for (let j = rows - 1; j >= 0; j--) {
      rotatedPiece[i].push(pieceShape[j][i]);
    }
  }
  return rotatedPiece;
}

function arraysMatch(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].toString() !== arr2[i].toString()) return false;
  }
  return true;
}

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 &&
        (board[y + piece.position.y]?.[x + piece.position.x] !== 0 ||
          x + piece.position.x < 0 ||
          x + piece.position.x >= BOARD_WIDTH ||
          y + piece.position.y >= BOARD_HEIGHT)
      );
    });
  });
}

function solidifyPiece() {
  let blocksCount = 0;
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
        blocksCount++;
      }
    });
  });

  score += blocksCount;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('tetrisHighScore', highScore);
  }

  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
  piece.position.y = 0;
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];

  playPiecePlacedSound();

  if (checkCollision()) {
    playGameOverSound();
    tetrisMusic.pause();
    tetrisMusic.currentTime = 0;
    window.alert("Game Over");
    gameRunning = false;
    score = 0;
    board.forEach(row => row.fill(0));
  }
}

function removeRows() {
  const rowsToRemove = [];
  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  if (rowsToRemove.length > 0) {
    playRowRemovedSound();
  }

  rowsToRemove.forEach(y => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
    score += 14;
  });
}

const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

startButton.addEventListener('click', () => {
  if (!gameRunning) {
    gameRunning = true;
    update();
    if (!isMuted) {
      tetrisMusic.play();
    }
  }
});

pauseButton.addEventListener('click', () => {
  if (!gamePaused && gameRunning) {
    gamePaused = true;
    pauseButton.textContent = 'Resume';
    if (!isMuted) {
      tetrisMusic.pause();
    }
  } else if (gamePaused && gameRunning) {
    gamePaused = false;
    pauseButton.textContent = 'Pause';
    update();
    if (!isMuted) {
      tetrisMusic.play();
    }
  }
});

restartButton.addEventListener('click', () => {
  gameRunning = false;
  gamePaused = false;
  score = 0;
  board.forEach(row => row.fill(0));
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
  piece.position.y = 0;
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];
  update();
  tetrisMusic.pause();
  tetrisMusic.currentTime = 0;
  pauseButton.textContent = 'Pause';
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (!isMuted && gameRunning) {
      tetrisMusic.pause();
    }
  } else {
    if (!isMuted && gameRunning && !gamePaused) {
      tetrisMusic.play();
    }
  }
});

document.addEventListener('keydown', event => {
  if (gameRunning && !gamePaused) {
    if (event.key === 'ArrowLeft') {
      piece.position.x--;
      if (checkCollision()) {
        piece.position.x++;
      }
    }
    if (event.key === 'ArrowRight') {
      piece.position.x++;
      if (checkCollision()) {
        piece.position.x--;
      }
    }
    if (event.key === 'ArrowDown') {
      piece.position.y++;
      if (checkCollision()) {
        piece.position.y--;
        solidifyPiece();
        removeRows();
      }
    }
    if (event.key === 'ArrowUp') {
      const rotated = [];
      for (let i = 0; i < piece.shape[0].length; i++) {
        const row = [];
        for (let j = piece.shape.length - 1; j >= 0; j--) {
          row.push(piece.shape[j][i]);
        }
        rotated.push(row);
      }
      const previousShape = piece.shape;
      piece.shape = rotated;
      if (checkCollision()) {
        piece.shape = previousShape;
      }
    }
    if (event.key === ' ') {
      while (!checkCollision()) {
        piece.position.y++;
      }
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }
});

update();