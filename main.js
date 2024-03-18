// import './style.css';

// const canvas = document.querySelector('canvas');
// const context = canvas.getContext('2d');

// const BLOCK_SIZE = 20;
// const BOARD_WIDTH = 14;
// const BOARD_HEIGHT = 30;

// const $score = document.querySelector('span');
// let score = 0;

// canvas.width = BLOCK_SIZE * BOARD_WIDTH;
// canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

// context.scale(BLOCK_SIZE, BLOCK_SIZE);

// const board = Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => 0));

// const piece = {
//   position: { x: Math.floor(BOARD_WIDTH / 2 - 2), y: 0 },
//   shape: [
//     [1, 1],
//     [1, 1]
//   ]
// };

// const PIECES = [
//   [
//     [1, 1],
//     [1, 1]
//   ],
//   [
//     [1, 1, 1, 1]
//   ],
//   [
//     [1, 1, 1],
//     [0, 1, 0]
//   ],
//   [
//     [1, 0],
//     [1, 1],
//     [0, 1]
//   ],
//   [
//     [0, 1],
//     [1, 1],
//     [1, 0]
//   ],
//   [
//     [1, 0],
//     [1, 0],
//     [1, 1]
//   ],
//   [
//     [0, 1],
//     [0, 1],
//     [1, 1]
//   ]
// ];

// let dropCounter = 0;
// let lastTime = 0;

// function update(time = 0) {
//   const deltaTime = time - lastTime;
//   lastTime = time;

//   dropCounter += deltaTime;

//   if (dropCounter > 300) {
//     piece.position.y++;
//     dropCounter = 0;
//     if (checkCollision()) {
//       piece.position.y--;
//       solidifyPiece();
//       removeRows();
//     }
//   }

//   draw();
//   window.requestAnimationFrame(update);
// }

// function draw() {
//   context.fillStyle = '#000';
//   context.fillRect(0, 0, canvas.width, canvas.height);

//   board.forEach((row, y) => {
//     row.forEach((value, x) => {
//       if (value === 1) {
//         context.fillStyle = 'yellow';
//         context.fillRect(x, y, 1, 1);
//       }
//     });
//   });

//   piece.shape.forEach((row, y) => {
//     row.forEach((value, x) => {
//       if (value) {
//         context.fillStyle = 'red';
//         context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
//       }
//     });
//   });

//  $score.innerText = score
// }

// document.addEventListener('keydown', event => {
//   if (event.key === 'ArrowLeft') {
//     piece.position.x--;
//     if (checkCollision()) {
//       piece.position.x++;
//     }
//   }
//   if (event.key === 'ArrowRight') {
//     piece.position.x++;
//     if (checkCollision()) {
//       piece.position.x--;
//     }
//   }
//   if (event.key === 'ArrowDown') {
//     piece.position.y++;
//     if (checkCollision()) {
//       piece.position.y--;
//       solidifyPiece();
//       removeRows();
//     }
//   }
//   if (event.key === 'ArrowUp') {
//     const rotated = [];
//     for (let i = 0; i < piece.shape[0].length; i++) {
//       const row = [];
//       for (let j = piece.shape.length - 1; j >= 0; j--) {
//         row.push(piece.shape[j][i]);
//       }
//       rotated.push(row);
//     }
//     const previousShape = piece.shape;
//     piece.shape = rotated;
//     if (checkCollision()) {
//       piece.shape = previousShape;
//     }
//   }
// });

// function checkCollision() {
//   return piece.shape.find((row, y) => {
//     return row.find((value, x) => {
//       return (
//         value !== 0 &&
//         (board[y + piece.position.y]?.[x + piece.position.x] !== 0 ||
//           x + piece.position.x < 0 ||
//           x + piece.position.x >= BOARD_WIDTH ||
//           y + piece.position.y >= BOARD_HEIGHT)
//       );
//     });
//   });
// }

// function solidifyPiece() {
//   let blocksCount = 0;
//   piece.shape.forEach((row, y) => {
//     row.forEach((value, x) => {
//       if (value === 1) {
//         board[y + piece.position.y][x + piece.position.x] = 1;
//         blocksCount++;
//       }
//     });
//   });

//   score += blocksCount;

//   piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2);
//   piece.position.y = 0;
//   piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)];

//   if (checkCollision()) {
//     window.alert("Game Over");
//     score = 0;
//     board.forEach((row) => row.fill(0));
//   }
// }

// function removeRows() {
//   const rowsToRemove = [];
//   board.forEach((row, y) => {
//     if (row.every(value => value === 1)) {
//       rowsToRemove.push(y);
//     }
//   });

//   rowsToRemove.forEach(y => {
//     board.splice(y, 1);
//     const newRow = Array(BOARD_WIDTH).fill(0);
//     board.unshift(newRow);
//     score += 14;
//   });
// }

// update();

import './style.css';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const BLOCK_SIZE = 20;
const BOARD_WIDTH = 14;
const BOARD_HEIGHT = 30;

const $score = document.querySelector('span');
const $highScore = document.querySelector('#highScore');
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

    if (dropCounter > 300) {
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

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = 'yellow';
        context.fillRect(x, y, 1, 1);
      }
    });
  });

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'red';
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });

  $score.innerText = score;
  $highScore.innerText = highScore;
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

  if (checkCollision()) {
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

  rowsToRemove.forEach(y => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
    score += 14;
  });
}

// Botones de control
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');

startButton.addEventListener('click', () => {
  if (!gameRunning) {
    gameRunning = true;
    update();
  }
});

pauseButton.addEventListener('click', () => {
  if (!gamePaused && gameRunning) {
    gamePaused = true;
    pauseButton.textContent = 'Resume';
  } else if (gamePaused && gameRunning) {
    gamePaused = false;
    pauseButton.textContent = 'Pause';
    update();
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
  }
});

update();
