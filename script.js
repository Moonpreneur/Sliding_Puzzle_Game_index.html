let movesCount = 0;
let startTime = 0;
let timerInterval;
let currentGame = 9;

const getShuffledArray = (size) => {
  const array = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const animateShuffle = (tableEl, shuffleSteps) => {
  let i = 0;

  const interval = setInterval(() => {
    if (i >= shuffleSteps.length) {
      clearInterval(interval);
      return;
    }

    const [emptyCell, targetCell] = shuffleSteps[i];
    
    const tempContent = emptyCell.innerHTML;
    emptyCell.innerHTML = targetCell.innerHTML;
    targetCell.innerHTML = tempContent;

    const tempClass = emptyCell.className;
    emptyCell.className = targetCell.className;
    targetCell.className = tempClass;

    updateCellColor(emptyCell);
    updateCellColor(targetCell);

    i++;
  }, 300); 
};

const generateNewField = (size, shuffled = false) => {
  const values = shuffled ? getShuffledArray(size - 1) : Array.from({ length: size - 1 }, (_, i) => i + 1);
  values.push(size); 
  const tableEl = document.createElement('table');
  const gridSize = Math.sqrt(size);
  const shuffleSteps = [];

  let emptyCell;

  for (let i = 0; i < gridSize; i += 1) {
    const row = tableEl.insertRow();
    for (let j = 0; j < gridSize; j += 1) {
      const cell = row.insertCell();
      cell.className = 'cell';
      const value = values.shift();
      if (value && value !== size) {
        cell.textContent = value;
        cell.style.backgroundColor = 'gray'; 
      } else {
        cell.classList.add('empty-cell');
        emptyCell = cell;
      }
    }
  }

  if (shuffled) {
    const steps = 20; 
    for (let step = 0; step < steps; step++) {
      const emptyCellX = emptyCell.cellIndex;
      const emptyCellY = emptyCell.parentNode.rowIndex;
      const possibleMoves = [];

      if (emptyCellX > 0) possibleMoves.push(tableEl.rows[emptyCellY].cells[emptyCellX - 1]); 
      if (emptyCellX < gridSize - 1) possibleMoves.push(tableEl.rows[emptyCellY].cells[emptyCellX + 1]); 
      if (emptyCellY > 0) possibleMoves.push(tableEl.rows[emptyCellY - 1].cells[emptyCellX]); 
      if (emptyCellY < gridSize - 1) possibleMoves.push(tableEl.rows[emptyCellY + 1].cells[emptyCellX]); 

      const randomCell = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      shuffleSteps.push([emptyCell, randomCell]);
      emptyCell = randomCell; 
    }
    
    animateShuffle(tableEl, shuffleSteps); 
  }

  return tableEl;
};

const refreshField = (shuffled = false) => {
  const heading = document.querySelector('.heading');
  const subheading = document.querySelector('.subheading');
  const table = document.querySelector('.table-container');
  const result = document.querySelector('.result-container');
  
  heading.innerHTML = `Game of ${currentGame}`;
  subheading.innerHTML = '';
  result.innerHTML = '';
  heading.classList.remove('rainbow');
  table.innerHTML = '';
  startTime = new Date();
  movesCount = 0;
  const moveCounter = document.querySelector('.move-counter');
  moveCounter.innerHTML = `Moves: ${movesCount}`;
  
  if (currentGame === 15) {
    table.append(generateNewField(16, shuffled)); 
  } else {
    table.append(generateNewField(9, shuffled)); 
  }
};

const isPuzzleSolved = () => {
  const cells = document.querySelectorAll('.cell');
  const cellsValues = [...cells].map((cell) => +cell.textContent);
  for (let i = 0; i < cellsValues.length - 1; i += 1) {
    if (cellsValues[i] !== i + 1) return false;
  }
  return true;
};

const playWinnerSound = () => {
  const audio = document.getElementById('winner-sound');
  audio.play();
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 5000);
};

const displayWinnerGif = () => {
  const gifContainer = document.createElement('div');
  gifContainer.style.position = 'fixed';
  gifContainer.style.top = '50%';
  gifContainer.style.left = '50%';
  gifContainer.style.transform = 'translate(-50%, -50%)';
  gifContainer.style.zIndex = '1000';
  gifContainer.style.pointerEvents = 'none';

  const gif = document.createElement('img');
  gif.src = 'https://i.gifer.com/XlNx.gif'; 
  gif.style.width = '200px'; 
  gif.style.height = 'auto';

  gifContainer.appendChild(gif);
  document.body.appendChild(gifContainer);

  setTimeout(() => {
    document.body.removeChild(gifContainer);
  }, 5000); 
};

const updateAllToGreen = () => {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell) => {
    if (!cell.classList.contains('empty-cell')) {
      cell.style.backgroundColor = 'green';
    }
  });
};

const restartGame = () => {
  if (isPuzzleSolved()) {
    updateAllToGreen(); // Change all tiles to green when solved
    clearInterval(timerInterval);
    const heading = document.querySelector('.heading');
    const subheading = document.querySelector('.subheading');
    const result = document.querySelector('.result-container');
    const endTime = new Date();
    const gameTime = Math.floor((endTime - startTime) / 1000);
    heading.innerHTML = 'You win!';
    subheading.innerHTML = 'auto-restart in 5 sec...';
    result.innerHTML = `Your result is ${movesCount} steps and ${gameTime} seconds`;
    heading.classList.add('rainbow');
    playWinnerSound(); 
    displayWinnerGif();
    setTimeout(() => {
      showStartScreen(); 
    }, 5000);
  }
};

const playClickSound = () => {
  const audio = document.getElementById('click-sound');
  audio.play();
};

const updateCellColor = (cell) => {
  const value = parseInt(cell.textContent);
  const correctPosition = Array.from(cell.parentNode.parentNode.rows).indexOf(cell.parentNode) * Math.sqrt(currentGame + 1) + cell.cellIndex + 1;
  
  if (value === correctPosition) {
    cell.style.backgroundColor = 'green'; 
  } else {
    cell.style.backgroundColor = 'red'; 
  }
};

const makeMove = (emptyCell, targetCell, countMove = true) => {
  emptyCell.classList.remove('empty-cell');
  emptyCell.textContent = targetCell.textContent;
  emptyCell.style.backgroundColor = targetCell.style.backgroundColor; 

  targetCell.classList.add('empty-cell');
  targetCell.textContent = '';
  targetCell.style.backgroundColor = ''; 

  updateCellColor(emptyCell); 
  playClickSound();

  if (countMove) {
    movesCount += 1;
    const moveCounter = document.querySelector('.move-counter');
    moveCounter.innerHTML = `Moves: ${movesCount}`;
  }

  restartGame();
};

const handleClick = (event) => {
  const clickedCell = event.target;

  if (!clickedCell.classList.contains('cell')) {
    return;
  }

  const emptyCell = document.querySelector('.empty-cell');
  const clickedCellX = clickedCell.cellIndex;
  const clickedCellY = clickedCell.parentNode.rowIndex;
  const emptyCellX = emptyCell.cellIndex;
  const emptyCellY = emptyCell.parentNode.rowIndex;

  const distance = Math.abs(clickedCellX - emptyCellX) + Math.abs(clickedCellY - emptyCellY);

  if (distance === 1) {
    makeMove(emptyCell, clickedCell);
  }
};

const handleKey = (event) => {
  const pressedKey = event.key;
  const emptyCell = document.querySelector('.empty-cell');

  const emptyCellX = emptyCell.cellIndex;
  const emptyCellY = emptyCell.parentNode.rowIndex;
  let targetCellX = emptyCellX;
  let targetCellY = emptyCellY;

  if (pressedKey === 'ArrowUp') targetCellY += 1;
  if (pressedKey === 'ArrowDown') targetCellY -= 1;
  if (pressedKey === 'ArrowLeft') targetCellX += 1;
  if (pressedKey === 'ArrowRight') targetCellX -= 1;
  if (pressedKey === 'KeyR') {
    refreshField();
    return;
  }

  const gridSize = Math.sqrt(currentGame === 15 ? 16 : 9);
  if (targetCellX < gridSize && targetCellX >= 0 && targetCellY < gridSize && targetCellY >= 0) {
    const targetCell = document.querySelector('table').rows[targetCellY].cells[targetCellX];

    if (!targetCell.classList.contains('empty-cell')) {
      makeMove(emptyCell, targetCell);
    }
  }
};

const showGameScreen = () => {
  document.getElementById('instructions-screen-9').style.display = 'none';
  document.getElementById('instructions-screen-15').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';
  refreshField();
  startTime = new Date();  
  startTimer();
};

const showInstructionsScreen = (game) => {
  currentGame = game;
  document.getElementById('start-screen').style.display = 'none';
  
  if (currentGame === 15) {
    document.getElementById('instructions-screen-15').style.display = 'flex';
  } else {
    document.getElementById('instructions-screen-9').style.display = 'flex';
  }
};

const showStartScreen = () => {
  document.getElementById('start-screen').style.display = 'flex';
  document.getElementById('instructions-screen-9').style.display = 'none';
  document.getElementById('instructions-screen-15').style.display = 'none';
  document.getElementById('game-screen').style.display = 'none';
  clearInterval(timerInterval);
};

const startTimer = () => {
  const timerEl = document.querySelector('.subheading');
  clearInterval(timerInterval);
  let elapsedTime = 0;
  timerInterval = setInterval(() => {
    elapsedTime += 1;
    timerEl.innerHTML = `Time: ${elapsedTime} seconds`;
  }, 1000);
};

const handleVolumeChange = (event) => {
  const clickSound = document.getElementById('click-sound');
  const winnerSound = document.getElementById('winner-sound');
  
  if (event.target.id === 'click-sound-volume') {
    clickSound.volume = event.target.value;
  } else if (event.target.id === 'winner-sound-volume') {
    winnerSound.volume = event.target.value;
  }
};

const run = () => {
  document.getElementById('game-of-9-button').addEventListener('click', () => showInstructionsScreen(9)); 
  document.getElementById('game-of-15-button').addEventListener('click', () => showInstructionsScreen(15));
  document.getElementById('start-game-button-9').addEventListener('click', showGameScreen);
  document.getElementById('start-game-button-15').addEventListener('click', showGameScreen);
  document.getElementById('shuffle-game-button').addEventListener('click', () => refreshField(true));
  document.getElementById('reset-game-button').addEventListener('click', showStartScreen);
  document.querySelector('.table-container').addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);
  document.getElementById('click-sound-volume').addEventListener('input', handleVolumeChange);
  document.getElementById('winner-sound-volume').addEventListener('input', handleVolumeChange);
};

run();






