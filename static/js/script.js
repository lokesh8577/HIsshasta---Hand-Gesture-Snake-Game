
// document.addEventListener('DOMContentLoaded', function() {
//     // Selection screen elements
//     const selectionScreen = document.getElementById('selection-screen');
//     const gameContent = document.getElementById('game-content');
//     const keyboardBtn = document.getElementById('keyboard-btn');
//     const gestureBtn = document.getElementById('gesture-btn');
//     const cameraSection = document.getElementById('camera-section');
//     const statsHistorySection = document.getElementById('stats-history-section');
    
//     // Game initialization flag
//     let gameInitialized = false;
    
//     // Keyboard option
//     keyboardBtn.addEventListener('click', function() {
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
        
//         // Show points history, hide camera
//         statsHistorySection.classList.remove('hidden');
//         cameraSection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         // Show start screen for keyboard mode
//         document.getElementById('game-start').style.display = 'flex';
//     });
    
//     // Gesture option
//     gestureBtn.addEventListener('click', function() {
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
        
//         // Show camera, hide points history
//         cameraSection.classList.remove('hidden');
//         statsHistorySection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         // Show start screen for gesture mode
//         document.getElementById('game-start').style.display = 'flex';
        
//         // Initialize gesture controls
//         if (window.initGestureControls) {
//             initGestureControls();
//         }
//     });
    
//     // Initialize the game (only once)
//     function initializeGame() {
//         // Game constants
//         const GRID_SIZE = 30;
//         const ROWS = 15;
//         const COLS = 15;
//         const GAME_SPEED = 100;
//         const MAX_HISTORY_ITEMS = 10;
//         const HISTORY_STORAGE_KEY = 'snakeGameHistory';

//         // Get elements
//         const canvas = document.getElementById('game-canvas');
//         if (!canvas) {
//             console.error('Canvas element not found!');
//             return;
//         }

//         const ctx = canvas.getContext('2d');
//         const scoreDisplay = document.getElementById('score-display');
//         const highScoreDisplay = document.getElementById('high-score-display');
//         const restartBtn = document.getElementById('restart-btn');
//         const gameOverScreen = document.getElementById('game-over');
//         const gameStartScreen = document.getElementById('game-start');
//         const startBtn = document.getElementById('start-btn');
//         const gestureDisplay = document.getElementById('current-gesture');

//         // Check if all required elements exist
//         if (!scoreDisplay || !highScoreDisplay || !restartBtn || !gameOverScreen || 
//             !gameStartScreen || !startBtn) {
//             console.error('One or more required elements not found!');
//             return;
//         }

//         // Game variables
//         let snake = [];
//         let food = {};
//         let direction = 'right';
//         let nextDirection = 'right';
//         let gameInterval;
//         let score = 0;
//         let highScore = localStorage.getItem('snakeHighScore') || 0;
//         let isPaused = false;
//         let isGameRunning = false;
//         let lastGesture = '';
//         let eventSource = null;
//         let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

//         // Load food image
//         const foodImg = new Image();
//         foodImg.src = 'https://cdn-icons-png.flaticon.com/512/3082/3082035.png';

//         // Initialize canvas size
//         function initCanvas() {
//             const container = document.querySelector('.game-board');
//             if (!container) return;

//             const size = Math.min(container.clientWidth, container.clientHeight);
//             canvas.width = COLS * GRID_SIZE;
//             canvas.height = ROWS * GRID_SIZE;
//             canvas.style.width = `${size}px`;
//             canvas.style.height = `${size}px`;
//         }
        
//         // Show start screen
//         function showStartScreen() {
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             if (gameStartScreen) gameStartScreen.style.display = 'flex';
//         }

//         // Initialize game
//         function initGame() {
//             if (gameStartScreen) gameStartScreen.style.display = 'none';
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             isGameRunning = true;

//             // Reinitialize gesture controls if in gesture mode
//             if (cameraSection && !cameraSection.classList.contains('hidden')){
//                 if (window.initGestureControls) {
//                     initGestureControls();
//                 }
//             }

//             const startX = Math.floor(COLS / 2) * GRID_SIZE;
//             const startY = Math.floor(ROWS / 2) * GRID_SIZE;

//             snake = [
//                 { x: startX, y: startY },
//                 { x: startX - GRID_SIZE, y: startY },
//                 { x: startX - GRID_SIZE * 2, y: startY }
//             ];

//             direction = 'right';
//             nextDirection = 'right';
//             score = 0;
//             if (scoreDisplay) scoreDisplay.textContent = score;
//             if (highScoreDisplay) highScoreDisplay.textContent = highScore;

//             generateFood();
//             clearInterval(gameInterval);
//             gameInterval = setInterval(gameLoop, GAME_SPEED);
//         }

//         // Game loop
//         function gameLoop() {
//             if (isPaused || !isGameRunning) return;
//             moveSnake();
//             checkCollision();
//             drawGame();
//         }

//         // Move snake
//         function moveSnake() {
//             direction = nextDirection;

//             // Move body (except head)
//             for (let i = snake.length - 1; i > 0; i--) {
//                 snake[i].x = snake[i - 1].x;
//                 snake[i].y = snake[i - 1].y;
//             }

//             // Move head based on direction
//             const head = snake[0];
//             switch (direction) {
//                 case 'up': head.y -= GRID_SIZE; break;
//                 case 'down': head.y += GRID_SIZE; break;
//                 case 'left': head.x -= GRID_SIZE; break;
//                 case 'right': head.x += GRID_SIZE; break;
//             }

//             // Check if snake ate food
//             if (head.x === food.x && head.y === food.y) {
//                 const tail = snake[snake.length - 1];
//                 snake.push({ x: tail.x, y: tail.y });

//                 score += 10;
//                 if (scoreDisplay) scoreDisplay.textContent = score;
//                 if (score > highScore) {
//                     highScore = score;
//                     if (highScoreDisplay) highScoreDisplay.textContent = highScore;
//                     localStorage.setItem('snakeHighScore', highScore);
//                 }

//                 generateFood();
//             }
//         }

//         // Generate food
//         function generateFood() {
//             let foodX, foodY;
//             let validPosition = false;

//             while (!validPosition) {
//                 foodX = Math.floor(Math.random() * COLS) * GRID_SIZE;
//                 foodY = Math.floor(Math.random() * ROWS) * GRID_SIZE;
//                 validPosition = true;

//                 for (const segment of snake) {
//                     if (segment.x === foodX && segment.y === foodY) {
//                         validPosition = false;
//                         break;
//                     }
//                 }
//             }

//             food = { x: foodX, y: foodY };
//         }

//         // Check collisions
//         function checkCollision() {
//             const head = snake[0];

//             // Wall collision
//             if (head.x < 0 || head.x >= COLS * GRID_SIZE ||
//                 head.y < 0 || head.y >= ROWS * GRID_SIZE) {
//                 gameOver();
//                 return;
//             }

//             // Self collision
//             for (let i = 1; i < snake.length; i++) {
//                 if (head.x === snake[i].x && head.y === snake[i].y) {
//                     gameOver();
//                     return;
//                 }
//             }
//         }

//         // Game over
//         function gameOver() {
//             clearInterval(gameInterval);
//             if (eventSource) eventSource.close();
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'flex';
            
//             // Determine the current mode
//             const currentMode = cameraSection && !cameraSection.classList.contains('hidden') ? 'gesture' : 'keyboard';
            
//             // Update history with the current score
//             if (score > 0) {
//                 updateHistory(score, currentMode);
//             }
//         }

//         // Update score history
//         function updateHistory(newScore, mode) {
//             // Add new score to history
//             const historyItem = {
//                 score: newScore,
//                 date: new Date().toLocaleString(),
//                 mode: mode || 'keyboard'
//             };
            
//             scoreHistory.unshift(historyItem);
            
//             // Keep only the last MAX_HISTORY_ITEMS items
//             if (scoreHistory.length > MAX_HISTORY_ITEMS) {
//                 scoreHistory = scoreHistory.slice(0, MAX_HISTORY_ITEMS);
//             }
            
//             // Save to localStorage
//             localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(scoreHistory));
            
//             // Update UI
//             renderHistory();
//             updateTimeline();
//         }

//         // Render history table
//         function renderHistory() {
//             const tableBody = document.getElementById('history-table-body');
//             if (!tableBody) return;
            
//             tableBody.innerHTML = '';
            
//             if (scoreHistory.length === 0) {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
//                 tableBody.appendChild(row);
//                 return;
//             }
            
//             scoreHistory.forEach((item, index) => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${item.score}</td>
//                     <td>${item.date}</td>
//                     <td>${item.mode}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         }

//         // Update timeline visualization
//         function updateTimeline() {
//             if (scoreHistory.length === 0) return;
            
//             const timelineBar = document.getElementById('points-timeline');
//             if (!timelineBar) return;
            
//             const scores = scoreHistory.map(item => item.score);
//             const maxScore = Math.max(...scores);
//             const lastScore = scoreHistory[0].score;
//             const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            
//             // Update key moments
//             const peakMoment = document.querySelector('#peak-moment .event-text');
//             const lastMoment = document.querySelector('#last-moment .event-text');
//             const avgMoment = document.querySelector('#average-moment .event-text');
            
//             if (peakMoment) peakMoment.textContent = `Peak: ${maxScore}`;
//             if (lastMoment) lastMoment.textContent = `Last: ${lastScore}`;
//             if (avgMoment) avgMoment.textContent = `Avg: ${avgScore}`;
            
//             // Update timeline visualization
//             timelineBar.innerHTML = '';
            
//             scoreHistory.slice().reverse().forEach((item, index) => {
//                 const segment = document.createElement('div');
//                 segment.className = 'timeline-segment';
//                 segment.style.height = `${(item.score / maxScore) * 100}%`;
//                 segment.title = `Score: ${item.score}\nDate: ${item.date}\nMode: ${item.mode}`;
//                 timelineBar.appendChild(segment);
//             });
//         }

//         // Draw snake head with eyes and tongue
//         function drawHead(x, y, dir) {
//             ctx.save();
//             ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//             switch (dir) {
//                 case 'up': ctx.rotate(-Math.PI / 2); break;
//                 case 'down': ctx.rotate(Math.PI / 2); break;
//                 case 'left': ctx.rotate(Math.PI); break;
//                 case 'right': break;
//             }

//             ctx.beginPath();
//             ctx.roundRect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 10);
//             ctx.fillStyle = '#4CAF50';
//             ctx.fill();
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.beginPath();
//             ctx.arc(GRID_SIZE / 4, -GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
//             ctx.arc(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
//             ctx.fillStyle = 'white';
//             ctx.fill();

//             ctx.beginPath();
//             ctx.arc(GRID_SIZE / 4 + 2, -GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
//             ctx.arc(GRID_SIZE / 4 + 2, GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
//             ctx.fillStyle = 'black';
//             ctx.fill();

//             if (dir === 'right' || dir === 'left') {
//                 ctx.beginPath();
//                 ctx.moveTo(GRID_SIZE / 2, 0);
//                 ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, -GRID_SIZE / 8);
//                 ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, GRID_SIZE / 8);
//                 ctx.closePath();
//                 ctx.fillStyle = 'red';
//                 ctx.fill();
//             }

//             ctx.restore();
//         }

//         // Draw snake tail
//         function drawTail(x, y, dir) {
//             ctx.save();
//             ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//             switch (dir) {
//                 case 'up': ctx.rotate(0); break;
//                 case 'right': ctx.rotate(Math.PI / 2); break;
//                 case 'down': ctx.rotate(Math.PI); break;
//                 case 'left': ctx.rotate(-Math.PI / 2); break;
//             }

//             ctx.beginPath();
//             ctx.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
//             ctx.fillStyle = '#66bb6a';
//             ctx.fill();
            
//             ctx.beginPath();
//             ctx.moveTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.lineTo(GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.lineTo(GRID_SIZE / 2, 0);
//             ctx.moveTo(-GRID_SIZE / 2, 0);
//             ctx.lineTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.fillStyle = '#66bb6a';
//             ctx.fill();
            
//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.restore();
//         }

//         // Draw game
//         function drawGame() {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             for (let row = 0; row < ROWS; row++) {
//                 for (let col = 0; col < COLS; col++) {
//                     ctx.fillStyle = (row + col) % 2 === 0 ? '#e8f5e9' : '#c8e6c9';
//                     ctx.fillRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                     ctx.strokeStyle = '#FF0000';
//                     ctx.lineWidth = .2;
//                     ctx.strokeRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                 }
//             }

//             if (foodImg.complete) {
//                 ctx.drawImage(foodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
//             } else {
//                 ctx.fillStyle = 'red';
//                 ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
//             }

//             for (let i = 1; i < snake.length - 1; i++) {
//                 const segment = snake[i];
//                 ctx.fillStyle = '#4CAF50';
//                 ctx.beginPath();
//                 ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
//                 ctx.fill();
//                 ctx.strokeStyle = 'black';
//                 ctx.lineWidth = 1;
//                 ctx.stroke();
//             }

//             if (snake.length > 1) {
//                 const tail = snake[snake.length - 1];
//                 const tailDir = getSegmentDirection(snake.length - 1);
//                 drawTail(tail.x, tail.y, tailDir);
//             }

//             if (snake.length > 0) {
//                 const head = snake[0];
//                 drawHead(head.x, head.y, direction);
//             }
//         }

//         function getSegmentDirection(index) {
//             if (index <= 0 || index >= snake.length) return direction;

//             const current = snake[index];
//             const next = snake[index - 1];

//             if (next.x > current.x) return 'right';
//             if (next.x < current.x) return 'left';
//             if (next.y > current.y) return 'down';
//             if (next.y < current.y) return 'up';

//             return direction;
//         }

//         function handleGesture(gesture) {
//             if (!isGameRunning) return;

//             const validDirections = ['up', 'down', 'left', 'right'];
//             if (!validDirections.includes(gesture)) return;

//             if ((direction === 'up' && gesture === 'down') ||
//                 (direction === 'down' && gesture === 'up') ||
//                 (direction === 'left' && gesture === 'right') ||
//                 (direction === 'right' && gesture === 'left')) {
//                 return;
//             }

//             nextDirection = gesture;
//         }

//         // Initialize SSE only for gesture mode
//         function initGestureControls() {
//             if (eventSource) eventSource.close();
            
//             eventSource = new EventSource('/gesture_stream');
//             eventSource.onmessage = (event) => {
//                 const newGesture = event.data.toLowerCase().trim();
//                 if (gestureDisplay) gestureDisplay.textContent = newGesture;
//                 lastGesture = newGesture;
//                 handleGesture(newGesture);
//             };

//             eventSource.onerror = () => {
//                 console.error("SSE connection error");
//                 if (gestureDisplay) gestureDisplay.textContent = "Disconnected";
//             };
//         }

//         // Keyboard controls
//         document.addEventListener('keydown', (e) => {
//             if (!isGameRunning) return;

//             switch (e.key) {
//                 case 'ArrowUp':
//                     if (direction !== 'down') nextDirection = 'up';
//                     break;
//                 case 'ArrowDown':
//                     if (direction !== 'up') nextDirection = 'down';
//                     break;
//                 case 'ArrowLeft':
//                     if (direction !== 'right') nextDirection = 'left';
//                     break;
//                 case 'ArrowRight':
//                     if (direction !== 'left') nextDirection = 'right';
//                     break;
//                 case ' ':
//                     isPaused = !isPaused;
//                     break;
//             }
//         });

//         // Button event listeners
//         if (startBtn) startBtn.addEventListener('click', initGame);
//         if (restartBtn) restartBtn.addEventListener('click', initGame);

//         // Initialize the game UI
//         initCanvas();
//         window.addEventListener('resize', initCanvas);
//         showStartScreen();
        
//         // Initialize history display
//         renderHistory();
//         updateTimeline();
        
//         // Make gesture controls available for the gesture button
//         window.initGestureControls = initGestureControls;
//     }
// });


// document.addEventListener('DOMContentLoaded', function() {
//     // Selection screen elements
//     const selectionScreen = document.getElementById('selection-screen');
//     const gameContent = document.getElementById('game-content');
//     const keyboardBtn = document.getElementById('keyboard-btn');
//     const gestureBtn = document.getElementById('gesture-btn');
//     const cameraSection = document.getElementById('camera-section');
//     const statsHistorySection = document.getElementById('stats-history-section');
    
//     // Game initialization flag
//     let gameInitialized = false;
//     let currentControlMode = null; // 'keyboard' or 'gesture'
    
//     // Keyboard option
//     keyboardBtn.addEventListener('click', function() {
//         currentControlMode = 'keyboard';
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
        
//         // Show points history, hide camera
//         statsHistorySection.classList.remove('hidden');
//         cameraSection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         // Show start screen for keyboard mode
//         document.getElementById('game-start').style.display = 'flex';
//     });
    
//     // Gesture option
//     gestureBtn.addEventListener('click', function() {
//         currentControlMode = 'gesture';
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
        
//         // Show camera, hide points history
//         cameraSection.classList.remove('hidden');
//         statsHistorySection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         // Show start screen for gesture mode
//         document.getElementById('game-start').style.display = 'flex';
        
//         // Initialize gesture controls
//         if (window.initGestureControls) {
//             initGestureControls();
//         }
//     });
    
//     // Initialize the game (only once)
//     function initializeGame() {
//         // Game constants
//         const GRID_SIZE = 30;
//         const ROWS = 15;
//         const COLS = 15;
//         const GAME_SPEED = 100;
//         const MAX_HISTORY_ITEMS = 10;
//         const HISTORY_STORAGE_KEY = 'snakeGameHistory';

//         // Get elements
//         const canvas = document.getElementById('game-canvas');
//         if (!canvas) {
//             console.error('Canvas element not found!');
//             return;
//         }

//         const ctx = canvas.getContext('2d');
//         const scoreDisplay = document.getElementById('score-display');
//         const highScoreDisplay = document.getElementById('high-score-display');
//         const restartBtn = document.getElementById('restart-btn');
//         const gameOverScreen = document.getElementById('game-over');
//         const gameStartScreen = document.getElementById('game-start');
//         const startBtn = document.getElementById('start-btn');
//         const gestureDisplay = document.getElementById('current-gesture');

//         // Check if all required elements exist
//         if (!scoreDisplay || !highScoreDisplay || !restartBtn || !gameOverScreen || 
//             !gameStartScreen || !startBtn) {
//             console.error('One or more required elements not found!');
//             return;
//         }

//         // Game variables
//         let snake = [];
//         let food = {};
//         let direction = 'right';
//         let nextDirection = 'right';
//         let gameInterval;
//         let score = 0;
//         let highScore = localStorage.getItem('snakeHighScore') || 0;
//         let isPaused = false;
//         let isGameRunning = false;
//         let lastGesture = '';
//         let eventSource = null;
//         let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

//         // Load food image
//         const foodImg = new Image();
//         foodImg.src = 'https://cdn-icons-png.flaticon.com/512/3082/3082035.png';

//         // Initialize canvas size
//         function initCanvas() {
//             const container = document.querySelector('.game-board');
//             if (!container) return;

//             const size = Math.min(container.clientWidth, container.clientHeight);
//             canvas.width = COLS * GRID_SIZE;
//             canvas.height = ROWS * GRID_SIZE;
//             canvas.style.width = `${size}px`;
//             canvas.style.height = `${size}px`;
//         }
        
//         // Show start screen
//         function showStartScreen() {
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             if (gameStartScreen) gameStartScreen.style.display = 'flex';
//         }

//         // Initialize game
//         function initGame() {
//             if (gameStartScreen) gameStartScreen.style.display = 'none';
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             isGameRunning = true;

//             // Reinitialize gesture controls if in gesture mode
//             if (currentControlMode === 'gesture') {
//                 if (window.initGestureControls) {
//                     initGestureControls();
//                 }
//             }

//             const startX = Math.floor(COLS / 2) * GRID_SIZE;
//             const startY = Math.floor(ROWS / 2) * GRID_SIZE;

//             snake = [
//                 { x: startX, y: startY },
//                 { x: startX - GRID_SIZE, y: startY },
//                 { x: startX - GRID_SIZE * 2, y: startY }
//             ];

//             direction = 'right';
//             nextDirection = 'right';
//             score = 0;
//             if (scoreDisplay) scoreDisplay.textContent = score;
//             if (highScoreDisplay) highScoreDisplay.textContent = highScore;

//             generateFood();
//             clearInterval(gameInterval);
//             gameInterval = setInterval(gameLoop, GAME_SPEED);
//         }

//         // Game loop
//         function gameLoop() {
//             if (isPaused || !isGameRunning) return;
//             moveSnake();
//             checkCollision();
//             drawGame();
//         }

//         // Move snake
//         function moveSnake() {
//             direction = nextDirection;

//             // Move body (except head)
//             for (let i = snake.length - 1; i > 0; i--) {
//                 snake[i].x = snake[i - 1].x;
//                 snake[i].y = snake[i - 1].y;
//             }

//             // Move head based on direction
//             const head = snake[0];
//             switch (direction) {
//                 case 'up': head.y -= GRID_SIZE; break;
//                 case 'down': head.y += GRID_SIZE; break;
//                 case 'left': head.x -= GRID_SIZE; break;
//                 case 'right': head.x += GRID_SIZE; break;
//             }

//             // Check if snake ate food
//             if (head.x === food.x && head.y === food.y) {
//                 const tail = snake[snake.length - 1];
//                 snake.push({ x: tail.x, y: tail.y });

//                 score += 10;
//                 if (scoreDisplay) scoreDisplay.textContent = score;
//                 if (score > highScore) {
//                     highScore = score;
//                     if (highScoreDisplay) highScoreDisplay.textContent = highScore;
//                     localStorage.setItem('snakeHighScore', highScore);
//                 }

//                 generateFood();
//             }
//         }

//         // Generate food
//         function generateFood() {
//             let foodX, foodY;
//             let validPosition = false;

//             while (!validPosition) {
//                 foodX = Math.floor(Math.random() * COLS) * GRID_SIZE;
//                 foodY = Math.floor(Math.random() * ROWS) * GRID_SIZE;
//                 validPosition = true;

//                 for (const segment of snake) {
//                     if (segment.x === foodX && segment.y === foodY) {
//                         validPosition = false;
//                         break;
//                     }
//                 }
//             }

//             food = { x: foodX, y: foodY };
//         }

//         // Check collisions
//         function checkCollision() {
//             const head = snake[0];

//             // Wall collision
//             if (head.x < 0 || head.x >= COLS * GRID_SIZE ||
//                 head.y < 0 || head.y >= ROWS * GRID_SIZE) {
//                 gameOver();
//                 return;
//             }

//             // Self collision
//             for (let i = 1; i < snake.length; i++) {
//                 if (head.x === snake[i].x && head.y === snake[i].y) {
//                     gameOver();
//                     return;
//                 }
//             }
//         }

//         // Game over
//         function gameOver() {
//             clearInterval(gameInterval);
//             if (eventSource) eventSource.close();
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'flex';
            
//             // Update history with the current score
//             if (score > 0) {
//                 updateHistory(score, currentControlMode);
//             }
//         }

//         // Update score history
//         function updateHistory(newScore, mode) {
//             // Add new score to history
//             const historyItem = {
//                 score: newScore,
//                 date: new Date().toLocaleString(),
//                 mode: mode || 'keyboard'
//             };
            
//             scoreHistory.unshift(historyItem);
            
//             // Keep only the last MAX_HISTORY_ITEMS items
//             if (scoreHistory.length > MAX_HISTORY_ITEMS) {
//                 scoreHistory = scoreHistory.slice(0, MAX_HISTORY_ITEMS);
//             }
            
//             // Save to localStorage
//             localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(scoreHistory));
            
//             // Update UI
//             renderHistory();
//             updateTimeline();
//         }

//         // Render history table
//         function renderHistory() {
//             const tableBody = document.getElementById('history-table-body');
//             if (!tableBody) return;
            
//             tableBody.innerHTML = '';
            
//             if (scoreHistory.length === 0) {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
//                 tableBody.appendChild(row);
//                 return;
//             }
            
//             scoreHistory.forEach((item, index) => {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${item.score}</td>
//                     <td>${item.date}</td>
//                     <td>${item.mode}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         }

//         // Update timeline visualization
//         function updateTimeline() {
//             if (scoreHistory.length === 0) return;
            
//             const timelineBar = document.getElementById('points-timeline');
//             if (!timelineBar) return;
            
//             const scores = scoreHistory.map(item => item.score);
//             const maxScore = Math.max(...scores);
//             const lastScore = scoreHistory[0].score;
//             const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            
//             // Update key moments
//             const peakMoment = document.querySelector('#peak-moment .event-text');
//             const lastMoment = document.querySelector('#last-moment .event-text');
//             const avgMoment = document.querySelector('#average-moment .event-text');
            
//             if (peakMoment) peakMoment.textContent = `Peak: ${maxScore}`;
//             if (lastMoment) lastMoment.textContent = `Last: ${lastScore}`;
//             if (avgMoment) avgMoment.textContent = `Avg: ${avgScore}`;
            
//             // Update timeline visualization
//             timelineBar.innerHTML = '';
            
//             scoreHistory.slice().reverse().forEach((item, index) => {
//                 const segment = document.createElement('div');
//                 segment.className = 'timeline-segment';
//                 segment.style.height = `${(item.score / maxScore) * 100}%`;
//                 segment.title = `Score: ${item.score}\nDate: ${item.date}\nMode: ${item.mode}`;
//                 timelineBar.appendChild(segment);
//             });
//         }

//         // Draw snake head with eyes and tongue
//         function drawHead(x, y, dir) {
//             ctx.save();
//             ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//             switch (dir) {
//                 case 'up': ctx.rotate(-Math.PI / 2); break;
//                 case 'down': ctx.rotate(Math.PI / 2); break;
//                 case 'left': ctx.rotate(Math.PI); break;
//                 case 'right': break;
//             }

//             ctx.beginPath();
//             ctx.roundRect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 10);
//             ctx.fillStyle = '#4CAF50';
//             ctx.fill();
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.beginPath();
//             ctx.arc(GRID_SIZE / 4, -GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
//             ctx.arc(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
//             ctx.fillStyle = 'white';
//             ctx.fill();

//             ctx.beginPath();
//             ctx.arc(GRID_SIZE / 4 + 2, -GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
//             ctx.arc(GRID_SIZE / 4 + 2, GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
//             ctx.fillStyle = 'black';
//             ctx.fill();

//             if (dir === 'right' || dir === 'left') {
//                 ctx.beginPath();
//                 ctx.moveTo(GRID_SIZE / 2, 0);
//                 ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, -GRID_SIZE / 8);
//                 ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, GRID_SIZE / 8);
//                 ctx.closePath();
//                 ctx.fillStyle = 'red';
//                 ctx.fill();
//             }

//             ctx.restore();
//         }

//         // Draw snake tail
//         function drawTail(x, y, dir) {
//             ctx.save();
//             ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//             switch (dir) {
//                 case 'up': ctx.rotate(0); break;
//                 case 'right': ctx.rotate(Math.PI / 2); break;
//                 case 'down': ctx.rotate(Math.PI); break;
//                 case 'left': ctx.rotate(-Math.PI / 2); break;
//             }

//             ctx.beginPath();
//             ctx.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
//             ctx.fillStyle = '#66bb6a';
//             ctx.fill();
            
//             ctx.beginPath();
//             ctx.moveTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.lineTo(GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.lineTo(GRID_SIZE / 2, 0);
//             ctx.moveTo(-GRID_SIZE / 2, 0);
//             ctx.lineTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.fillStyle = '#66bb6a';
//             ctx.fill();
            
//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.restore();
//         }

//         // Draw game
//         function drawGame() {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             for (let row = 0; row < ROWS; row++) {
//                 for (let col = 0; col < COLS; col++) {
//                     ctx.fillStyle = (row + col) % 2 === 0 ? '#e8f5e9' : '#c8e6c9';
//                     ctx.fillRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                     ctx.strokeStyle = '#FF0000';
//                     ctx.lineWidth = .2;
//                     ctx.strokeRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                 }
//             }

//             if (foodImg.complete) {
//                 ctx.drawImage(foodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
//             } else {
//                 ctx.fillStyle = 'red';
//                 ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
//             }

//             for (let i = 1; i < snake.length - 1; i++) {
//                 const segment = snake[i];
//                 ctx.fillStyle = '#4CAF50';
//                 ctx.beginPath();
//                 ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
//                 ctx.fill();
//                 ctx.strokeStyle = 'black';
//                 ctx.lineWidth = 1;
//                 ctx.stroke();
//             }

//             if (snake.length > 1) {
//                 const tail = snake[snake.length - 1];
//                 const tailDir = getSegmentDirection(snake.length - 1);
//                 drawTail(tail.x, tail.y, tailDir);
//             }

//             if (snake.length > 0) {
//                 const head = snake[0];
//                 drawHead(head.x, head.y, direction);
//             }
//         }

//         function getSegmentDirection(index) {
//             if (index <= 0 || index >= snake.length) return direction;

//             const current = snake[index];
//             const next = snake[index - 1];

//             if (next.x > current.x) return 'right';
//             if (next.x < current.x) return 'left';
//             if (next.y > current.y) return 'down';
//             if (next.y < current.y) return 'up';

//             return direction;
//         }

//         function handleGesture(gesture) {
//             if (!isGameRunning || currentControlMode !== 'gesture') return;

//             const validDirections = ['up', 'down', 'left', 'right'];
//             if (!validDirections.includes(gesture)) return;

//             if ((direction === 'up' && gesture === 'down') ||
//                 (direction === 'down' && gesture === 'up') ||
//                 (direction === 'left' && gesture === 'right') ||
//                 (direction === 'right' && gesture === 'left')) {
//                 return;
//             }

//             nextDirection = gesture;
//         }

//         // Initialize SSE only for gesture mode
//         function initGestureControls() {
//             if (eventSource) eventSource.close();
            
//             eventSource = new EventSource('/gesture_stream');
//             eventSource.onmessage = (event) => {
//                 const newGesture = event.data.toLowerCase().trim();
//                 if (gestureDisplay) gestureDisplay.textContent = newGesture;
//                 lastGesture = newGesture;
//                 handleGesture(newGesture);
//             };

//             eventSource.onerror = () => {
//                 console.error("SSE connection error");
//                 if (gestureDisplay) gestureDisplay.textContent = "Disconnected";
//             };
//         }

//         // Keyboard controls
//         function handleKeyDown(e) {
//             if (!isGameRunning || currentControlMode !== 'keyboard') return;

//             switch (e.key) {
//                 case 'ArrowUp':
//                     if (direction !== 'down') nextDirection = 'up';
//                     break;
//                 case 'ArrowDown':
//                     if (direction !== 'up') nextDirection = 'down';
//                     break;
//                 case 'ArrowLeft':
//                     if (direction !== 'right') nextDirection = 'left';
//                     break;
//                 case 'ArrowRight':
//                     if (direction !== 'left') nextDirection = 'right';
//                     break;
//                 case ' ':
//                     isPaused = !isPaused;
//                     break;
//             }
//         }

//         // Button event listeners
//         if (startBtn) startBtn.addEventListener('click', initGame);
//         if (restartBtn) restartBtn.addEventListener('click', initGame);

//         // Initialize the game UI
//         initCanvas();
//         window.addEventListener('resize', initCanvas);
//         showStartScreen();
        
//         // Initialize history display
//         renderHistory();
//         updateTimeline();
        
//         // Make gesture controls available for the gesture button
//         window.initGestureControls = initGestureControls;
        
//         // Add keyboard event listener
//         document.addEventListener('keydown', handleKeyDown);
//     }
// });










document.addEventListener('DOMContentLoaded', function() {
    // Selection screen elements
    const selectionScreen = document.getElementById('selection-screen');
    const gameContent = document.getElementById('game-content');
    const keyboardBtn = document.getElementById('keyboard-btn');
    const gestureBtn = document.getElementById('gesture-btn');
    const cameraSection = document.getElementById('camera-section');
    const statsHistorySection = document.getElementById('stats-history-section');
    
    // Game initialization flag
    let gameInitialized = false;
    let currentControlMode = null; // 'keyboard' or 'gesture'
    
    // Keyboard option
    keyboardBtn.addEventListener('click', function() {
        currentControlMode = 'keyboard';
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        
        // Show points history, hide camera
        statsHistorySection.classList.remove('hidden');
        cameraSection.classList.add('hidden');
        
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
        
        // Show start screen for keyboard mode
        document.getElementById('game-start').style.display = 'flex';
    });
    
    // Gesture option
    gestureBtn.addEventListener('click', function() {
        currentControlMode = 'gesture';
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        
        // Show camera, hide points history
        cameraSection.classList.remove('hidden');
        statsHistorySection.classList.add('hidden');
        
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
        
        // Show start screen for gesture mode
        document.getElementById('game-start').style.display = 'flex';
        
        // Initialize gesture controls
        if (window.initGestureControls) {
            initGestureControls();
        }
    });
    
    // Initialize the game (only once)
    function initializeGame() {
        // Game constants
        const GRID_SIZE = 30;
        const ROWS = 15;
        const COLS = 15;
        const GAME_SPEED = 100;
        const MAX_HISTORY_ITEMS = 10;
        const HISTORY_STORAGE_KEY = 'snakeGameHistory';

        // Get elements
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }

        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('score-display');
        const highScoreDisplay = document.getElementById('high-score-display');
        const restartBtn = document.getElementById('restart-btn');
        const gameOverScreen = document.getElementById('game-over');
        const gameStartScreen = document.getElementById('game-start');
        const startBtn = document.getElementById('start-btn');
        const gestureDisplay = document.getElementById('current-gesture');

        // Check if all required elements exist
        if (!scoreDisplay || !highScoreDisplay || !restartBtn || !gameOverScreen || 
            !gameStartScreen || !startBtn) {
            console.error('One or more required elements not found!');
            return;
        }

        // Game variables
        let snake = [];
        let food = {};
        let direction = 'right';
        let nextDirection = 'right';
        let gameInterval;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let isPaused = false;
        let isGameRunning = false;
        let lastGesture = '';
        let eventSource = null;
        let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

        // Load food image
        const foodImg = new Image();
        foodImg.src = 'https://cdn-icons-png.flaticon.com/512/3082/3082035.png';

        // Initialize canvas size
        function initCanvas() {
            const container = document.querySelector('.game-board');
            if (!container) return;

            const size = Math.min(container.clientWidth, container.clientHeight);
            canvas.width = COLS * GRID_SIZE;
            canvas.height = ROWS * GRID_SIZE;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
        }
        
        // Show start screen
        function showStartScreen() {
            isGameRunning = false;
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            if (gameStartScreen) gameStartScreen.style.display = 'flex';
        }

        // Initialize game
        function initGame() {
            if (gameStartScreen) gameStartScreen.style.display = 'none';
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            isGameRunning = true;

            // Reinitialize gesture controls if in gesture mode
            if (currentControlMode === 'gesture') {
                if (window.initGestureControls) {
                    initGestureControls();
                }
            }

            const startX = Math.floor(COLS / 2) * GRID_SIZE;
            const startY = Math.floor(ROWS / 2) * GRID_SIZE;

            snake = [
                { x: startX, y: startY },
                { x: startX - GRID_SIZE, y: startY },
                { x: startX - GRID_SIZE * 2, y: startY }
            ];

            direction = 'right';
            nextDirection = 'right';
            score = 0;
            if (scoreDisplay) scoreDisplay.textContent = score;
            if (highScoreDisplay) highScoreDisplay.textContent = highScore;

            generateFood();
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, GAME_SPEED);
        }

        // Game loop
        function gameLoop() {
            if (isPaused || !isGameRunning) return;
            moveSnake();
            checkCollision();
            drawGame();
        }

        // Move snake
        function moveSnake() {
            direction = nextDirection;

            // Move body (except head)
            for (let i = snake.length - 1; i > 0; i--) {
                snake[i].x = snake[i - 1].x;
                snake[i].y = snake[i - 1].y;
            }

            // Move head based on direction
            const head = snake[0];
            switch (direction) {
                case 'up': head.y -= GRID_SIZE; break;
                case 'down': head.y += GRID_SIZE; break;
                case 'left': head.x -= GRID_SIZE; break;
                case 'right': head.x += GRID_SIZE; break;
            }

            // Check if snake ate food
            if (head.x === food.x && head.y === food.y) {
                const tail = snake[snake.length - 1];
                snake.push({ x: tail.x, y: tail.y });

                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = score;
                if (score > highScore) {
                    highScore = score;
                    if (highScoreDisplay) highScoreDisplay.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }

                generateFood();
            }
        }

        // Generate food
        function generateFood() {
            let foodX, foodY;
            let validPosition = false;

            while (!validPosition) {
                foodX = Math.floor(Math.random() * COLS) * GRID_SIZE;
                foodY = Math.floor(Math.random() * ROWS) * GRID_SIZE;
                validPosition = true;

                for (const segment of snake) {
                    if (segment.x === foodX && segment.y === foodY) {
                        validPosition = false;
                        break;
                    }
                }
            }

            food = { x: foodX, y: foodY };
        }

        // Check collisions
        function checkCollision() {
            const head = snake[0];

            // Wall collision
            if (head.x < 0 || head.x >= COLS * GRID_SIZE ||
                head.y < 0 || head.y >= ROWS * GRID_SIZE) {
                gameOver();
                return;
            }

            // Self collision
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }
        }

        // Game over
        function gameOver() {
            clearInterval(gameInterval);
            if (eventSource) eventSource.close();
            isGameRunning = false;
            if (gameOverScreen) gameOverScreen.style.display = 'flex';
            
            // Update history with the current score
            if (score > 0) {
                updateHistory(score, currentControlMode);
            }
        }

        // Update score history
    function updateHistory(newScore, mode) {
    // Add new score to history
    const historyItem = {
        score: newScore,
        date: new Date().toLocaleString(),
        mode: mode || 'keyboard' // Default to keyboard if mode not specified
    };
    
    scoreHistory.unshift(historyItem);
    
    // Keep only the last MAX_HISTORY_ITEMS items
    if (scoreHistory.length > MAX_HISTORY_ITEMS) {
        scoreHistory = scoreHistory.slice(0, MAX_HISTORY_ITEMS);
    }
    
    // Save to localStorage
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(scoreHistory));
    
    // Update UI
    renderHistory();
    updateTimeline();
}

        // Render history table
        function renderHistory() {
    const tableBody = document.getElementById('history-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (scoreHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    scoreHistory.forEach((item, index) => {
        const row = document.createElement('tr');
        // Determine icon based on mode
        const modeIcon = item.mode === 'gesture' ? 
            '<i class="fas fa-hand-paper" title="Hand Gesture"></i>' : 
            '<i class="fas fa-keyboard" title="Keyboard"></i>';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.score}</td>
            <td>${item.date}</td>
            <td>${modeIcon}</td>
        `;
        tableBody.appendChild(row);
    });
}


        // Update timeline visualization
        function updateTimeline() {
            if (scoreHistory.length === 0) return;
            
            const timelineBar = document.getElementById('points-timeline');
            if (!timelineBar) return;
            
            const scores = scoreHistory.map(item => item.score);
            const maxScore = Math.max(...scores);
            const lastScore = scoreHistory[0].score;
            const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            
            // Update key moments
            const peakMoment = document.querySelector('#peak-moment .event-text');
            const lastMoment = document.querySelector('#last-moment .event-text');
            const avgMoment = document.querySelector('#average-moment .event-text');
            
            if (peakMoment) peakMoment.textContent = `Peak: ${maxScore}`;
            if (lastMoment) lastMoment.textContent = `Last: ${lastScore}`;
            if (avgMoment) avgMoment.textContent = `Avg: ${avgScore}`;
            
            // Update timeline visualization
            timelineBar.innerHTML = '';
            
            scoreHistory.slice().reverse().forEach((item, index) => {
                const segment = document.createElement('div');
                segment.className = 'timeline-segment';
                segment.style.height = `${(item.score / maxScore) * 100}%`;
                segment.title = `Score: ${item.score}\nDate: ${item.date}\nMode: ${item.mode}`;
                timelineBar.appendChild(segment);
            });
        }

        // Draw snake head with eyes and tongue
        function drawHead(x, y, dir) {
            ctx.save();
            ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

            switch (dir) {
                case 'up': ctx.rotate(-Math.PI / 2); break;
                case 'down': ctx.rotate(Math.PI / 2); break;
                case 'left': ctx.rotate(Math.PI); break;
                case 'right': break;
            }

            ctx.beginPath();
            ctx.roundRect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 10);
            ctx.fillStyle = '#4CAF50';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(GRID_SIZE / 4, -GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
            ctx.arc(GRID_SIZE / 4, GRID_SIZE / 4, GRID_SIZE / 8, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(GRID_SIZE / 4 + 2, -GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
            ctx.arc(GRID_SIZE / 4 + 2, GRID_SIZE / 4, GRID_SIZE / 12, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();

            if (dir === 'right' || dir === 'left') {
                ctx.beginPath();
                ctx.moveTo(GRID_SIZE / 2, 0);
                ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, -GRID_SIZE / 8);
                ctx.lineTo(GRID_SIZE / 2 + GRID_SIZE / 4, GRID_SIZE / 8);
                ctx.closePath();
                ctx.fillStyle = 'red';
                ctx.fill();
            }

            ctx.restore();
        }

        // Draw snake tail
        function drawTail(x, y, dir) {
            ctx.save();
            ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

            switch (dir) {
                case 'up': ctx.rotate(0); break;
                case 'right': ctx.rotate(Math.PI / 2); break;
                case 'down': ctx.rotate(Math.PI); break;
                case 'left': ctx.rotate(-Math.PI / 2); break;
            }

            ctx.beginPath();
            ctx.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
            ctx.fillStyle = '#66bb6a';
            ctx.fill();
            
            ctx.beginPath();
            ctx.moveTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
            ctx.lineTo(GRID_SIZE / 2, -GRID_SIZE / 2);
            ctx.lineTo(GRID_SIZE / 2, 0);
            ctx.moveTo(-GRID_SIZE / 2, 0);
            ctx.lineTo(-GRID_SIZE / 2, -GRID_SIZE / 2);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
            ctx.fillStyle = '#66bb6a';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // Draw game
        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    ctx.fillStyle = (row + col) % 2 === 0 ? '#e8f5e9' : '#c8e6c9';
                    ctx.fillRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                    ctx.strokeStyle = '#FF0000';
                    ctx.lineWidth = .2;
                    ctx.strokeRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                }
            }

            if (foodImg.complete) {
                ctx.drawImage(foodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
            } else {
                ctx.fillStyle = 'red';
                ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
            }

            for (let i = 1; i < snake.length - 1; i++) {
                const segment = snake[i];
                ctx.fillStyle = '#4CAF50';
                ctx.beginPath();
                ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            if (snake.length > 1) {
                const tail = snake[snake.length - 1];
                const tailDir = getSegmentDirection(snake.length - 1);
                drawTail(tail.x, tail.y, tailDir);
            }

            if (snake.length > 0) {
                const head = snake[0];
                drawHead(head.x, head.y, direction);
            }
        }

        function getSegmentDirection(index) {
            if (index <= 0 || index >= snake.length) return direction;

            const current = snake[index];
            const next = snake[index - 1];

            if (next.x > current.x) return 'right';
            if (next.x < current.x) return 'left';
            if (next.y > current.y) return 'down';
            if (next.y < current.y) return 'up';

            return direction;
        }

        function handleGesture(gesture) {
            if (!isGameRunning || currentControlMode !== 'gesture') return;

            const validDirections = ['up', 'down', 'left', 'right'];
            if (!validDirections.includes(gesture)) return;

            if ((direction === 'up' && gesture === 'down') ||
                (direction === 'down' && gesture === 'up') ||
                (direction === 'left' && gesture === 'right') ||
                (direction === 'right' && gesture === 'left')) {
                return;
            }

            nextDirection = gesture;
        }

        // Initialize SSE only for gesture mode
        function initGestureControls() {
            if (eventSource) eventSource.close();
            
            eventSource = new EventSource('/gesture_stream');
            eventSource.onmessage = (event) => {
                const newGesture = event.data.toLowerCase().trim();
                if (gestureDisplay) gestureDisplay.textContent = newGesture;
                lastGesture = newGesture;
                handleGesture(newGesture);
            };

            eventSource.onerror = () => {
                console.error("SSE connection error");
                if (gestureDisplay) gestureDisplay.textContent = "Disconnected";
            };
        }

        // Keyboard controls
        function handleKeyDown(e) {
            if (!isGameRunning || currentControlMode !== 'keyboard') return;

            switch (e.key) {
                case 'ArrowUp':
                    if (direction !== 'down') nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    if (direction !== 'up') nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    if (direction !== 'right') nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    if (direction !== 'left') nextDirection = 'right';
                    break;
                case ' ':
                    isPaused = !isPaused;
                    break;
            }
        }

        // Button event listeners
        if (startBtn) startBtn.addEventListener('click', initGame);
        if (restartBtn) restartBtn.addEventListener('click', initGame);

        // Initialize the game UI
        initCanvas();
        window.addEventListener('resize', initCanvas);
        showStartScreen();
        
        // Initialize history display
        renderHistory();
        updateTimeline();
        
        // Make gesture controls available for the gesture button
        window.initGestureControls = initGestureControls;
        
        // Add keyboard event listener
        document.addEventListener('keydown', handleKeyDown);
    }
});