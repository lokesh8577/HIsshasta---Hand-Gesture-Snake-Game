// document.addEventListener('DOMContentLoaded', function() {
//     // Firebase configuration
//     const firebaseConfig = {
//         apiKey: "AIzaSyDmeALZ7huDbG2ya3Mh9gZ-04wOG-0wRbI",
//         authDomain: "hand-snake-game-f3768.firebaseapp.com",
//         databaseURL: "https://hand-snake-game-f3768.firebaseio.com",
//         projectId: "hand-snake-game-f3768",
//         storageBucket: "hand-snake-game-f3768.appspot.com",
//         messagingSenderId: "113807589798155426981",
//         appId: "1:633783160028:web:e55b0788d0348e89eeb819"
//     };
    
//     // Initialize Firebase if not already initialized
//     if (!firebase.apps.length) {
//         firebase.initializeApp(firebaseConfig);
//     }

//     // Game elements
//     const selectionScreen = document.getElementById('selection-screen');
//     const gameContent = document.getElementById('game-content');
//     const keyboardBtn = document.getElementById('keyboard-btn');
//     const gestureBtn = document.getElementById('gesture-btn');
//     const cameraSection = document.getElementById('camera-section');
//     const statsHistorySection = document.getElementById('stats-history-section');
//     // Add these with your other DOM element selections at the top
// const gameModeBtn = document.querySelector('.nav-link .fa-gamepad') ? 
//                    document.querySelector('.nav-link .fa-gamepad').closest('.nav-link') : null;
// const paletteIcon = document.querySelector('.game-link .fa-palette') ? 
//                    document.querySelector('.game-link .fa-palette').closest('.game-link') : null;
    
    
//     // Auth elements
//     const loginBtn = document.getElementById('loginBtn');
//     const logoutBtn = document.getElementById('logoutBtn');
//     const profileBtn = document.getElementById('profileBtn');
//     const loginModal = document.getElementById('login-modal');
//     const closeModal = document.querySelector('.close-modal');
//     const loginForm = document.getElementById('login-form');
//     const signupForm = document.getElementById('signup-form');
//     const showSignup = document.getElementById('show-signup');
//     const showLogin = document.getElementById('show-login');
    
    
//     // Game state
//     let gameInitialized = false;
//     let currentControlMode = null;
//     let currentLeaderboardMode = 'keyboard';
    
//     // User state
//     let currentUserId = null;
//     let currentUsername = 'Guest';
//     let isAuthenticated = false;
    
//     // Initialize modal handlers
//     function initModal() {
//         if (loginBtn) {
//             loginBtn.addEventListener('click', () => {
//                 loginModal.style.display = 'block';
//                 showLoginForm();
//             });
//         }
        
//         if (closeModal) {
//             closeModal.addEventListener('click', () => {
//                 loginModal.style.display = 'none';
//             });
//         }
        
//         if (showSignup) {
//             showSignup.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 showSignupForm();
//             });
//         }
        
//         if (showLogin) {
//             showLogin.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 showLoginForm();
//             });
//         }
        
//         function showLoginForm() {
//             if (loginForm && signupForm) {
//                 loginForm.style.display = 'block';
//                 signupForm.style.display = 'none';
//             }
//         }
        
//         function showSignupForm() {
//             if (loginForm && signupForm) {
//                 loginForm.style.display = 'none';
//                 signupForm.style.display = 'block';
//             }
//         }
//     }
    
    
//     // Handle authentication
//     async function handleLogin(email, password) {
//     try {
//         const response = await fetch('/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
//         });
        
//         if (response.ok) {
//             // Get Firebase token after successful login
//             const tokenResponse = await fetch('/get_firebase_token');
//             const { token } = await tokenResponse.json();
            
//             // Sign in to Firebase
//             await firebase.auth().signInWithCustomToken(token);
            
//             // Now check auth state to update UI
//             await checkAuthState();
//             return true;
//         }
//         return false;
//     } catch (error) {
//         console.error('Login error:', error);
//         return false;
//     }
// }

//     async function updateUserHighScore(score, mode, idToken) {
//         try {
//             const response = await fetch('/api/update_user_score', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${idToken}`
//                 },
//                 body: JSON.stringify({
//                     mode: mode,
//                     score: score
//                 })
//             });
            
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
            
//             const data = await response.json();
//             if (data.success) {
//                 console.log('User high score updated successfully');
//                 return true;
//             } else {
//                 console.log('User high score not updated:', data.message);
//                 return false;
//             }
//         } catch (error) {
//             console.error('Error updating user high score:', error);
//             return false;
//         }
//     }



    
//     async function handleSignup(username, email, password) {
//         try {
//             const response = await fetch('/signup', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
//             });
            
//             if (response.ok) {
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Signup error:', error);
//             return false;
//         }
//     }
    
//     async function handleLogout() {
//         try {
//             const response = await fetch('/logout', {
//                 method: 'POST'
//             });
            
//             if (response.ok) {
//                 currentUserId = null;
//                 currentUsername = 'Guest';
//                 isAuthenticated = false;
                
//                 updateProfileDisplay();
//                 fetchLeaderboard(currentLeaderboardMode);
                
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Logout error:', error);
//             return false;
//         }
//     }
    
//     // Update UI with user info
//     function updateProfileDisplay() {
//         // Update all username displays
//         document.querySelectorAll('.username-display').forEach(el => {
//             el.textContent = currentUsername;
//         });
        
//         // Update profile button if exists
//         if (profileBtn) {
//             const usernameSpan = profileBtn.querySelector('.username');
//             if (usernameSpan) {
//                 usernameSpan.textContent = currentUsername;
//             }
//         }
        
//         // Toggle login/logout buttons
//         if (loginBtn && logoutBtn) {
//             loginBtn.style.display = isAuthenticated ? 'none' : 'block';
//             logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
//         }
//     }
    
//     // Check auth state on page load
//    async function checkAuthState() {
//     try {
//         // Check Flask session first
//         const response = await fetch('/check-auth');
//         const data = await response.json();
        
//         if (data.authenticated) {
//             currentUserId = data.user.uid;
//             currentUsername = data.user.display_name;
//             isAuthenticated = true;
            
//             // Now sync with Firebase
//             try {
//                 const user = firebase.auth().currentUser;
//                 if (!user) {
//                     // If no Firebase user but Flask session exists
//                     const customTokenResponse = await fetch('/get_firebase_token');
//                     const { token } = await customTokenResponse.json();
//                     await firebase.auth().signInWithCustomToken(token);
//                 }
//             } catch (firebaseError) {
//                 console.error("Firebase sync error:", firebaseError);
//             }
//         } else {
//             currentUserId = null;
//             currentUsername = 'Guest';
//             isAuthenticated = false;
//         }
        
//         updateProfileDisplay();
//     } catch (error) {
//         console.error('Error checking auth state:', error);
//         currentUserId = null;
//         currentUsername = 'Guest';
//         isAuthenticated = false;
//         updateProfileDisplay();
//     }
// }
    
//     // Leaderboard functions
//     function renderLeaderboardEntry(entry, mode) {
//         const li = document.createElement('li');
//         li.className = 'leaderboard-entry';
//         li.dataset.userId = entry.userId;
        
//         // Highlight current user
//         if (currentUserId && entry.userId === currentUserId) {
//             li.classList.add('current-user');
//         }
        
//         // Highlight active session
//         if (entry.in_session) {
//             li.classList.add('highlighted');
//         }
        
//         li.innerHTML = `
//             <span class="rank">${entry.rank}.</span>
//             <span class="username">${entry.username || 'Anonymous'}</span>
//             <span class="score">${entry.score || 0}</span>
             
//         `;
        
//         return li;
//     }

// async function fetchLeaderboard(mode) {
//     const leaderboardList = document.getElementById('leaderboard-list');
//     if (!leaderboardList) return;
    
//     try {
//         leaderboardList.innerHTML = '<li class="loading">Loading leaderboard...</li>';
        
//         const response = await fetch(`/api/leaderboard?mode=${mode}`);
        
//         if (!response.ok) {
//             throw new Error(`Server returned ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         if (!Array.isArray(data)) {
//             throw new Error('Invalid leaderboard data');
//         }
        
//         leaderboardList.innerHTML = '';
        
//         if (data.length === 0) {
//             const noScoresItem = document.createElement('li');
//             noScoresItem.className = 'no-scores';
//             noScoresItem.textContent = 'No scores yet';
//             leaderboardList.appendChild(noScoresItem);
//             return;
//         }
        
//         data.forEach((entry) => {
//             const li = renderLeaderboardEntry(entry, mode);
//             leaderboardList.appendChild(li);
//         });
        
//         // Update status message
//         const statusElement = document.getElementById('leaderboard-status');
//         if (statusElement) {
//             statusElement.textContent = `Showing ${data.length} top players`;
//         }
//     } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//         leaderboardList.innerHTML = `
//             <li class="error">
//                 Failed to load leaderboard: ${error.message}
//                 <button onclick="window.fetchLeaderboard('${mode}')">Retry</button>
//             </li>
//         `;
//     }
// }

// // Make the function available globally
// window.fetchLeaderboard = fetchLeaderboard;



// async function updateLeaderboard(score, mode) {
//     try {
//         // Get the current Firebase user
//         const user = firebase.auth().currentUser;
        
//         if (!user) {
//             console.error("No authenticated user found");
//             const auth = await fetch('/check-auth');
//             const authData = await auth.json();
//             if (authData.authenticated) {
//                 console.log("Session exists but Firebase not synced");
//                 // Try to refresh Firebase auth
//                 await firebase.auth().signOut();
//                 const token = await user.getIdToken(true); // Force token refresh
//                 return updateLeaderboard(score, mode); // Retry
//             }
//             return false;
//         }

//         const idToken = await user.getIdToken();
//         console.log("Updating score for user:", user.uid, "Score:", score);

//         // Update user's personal high score
//         const userResponse = await fetch('/api/update_user_score', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${idToken}`
//             },
//             body: JSON.stringify({
//                 mode: mode,
//                 score: score
//             })
//         });

//         const userData = await userResponse.json();
//         if (!userData.success) {
//             console.error("Failed to update user score:", userData.message);
//             return false;
//         }

//         // Update leaderboard
//         const lbResponse = await fetch('/api/update_leaderboard', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${idToken}`
//             },
//             body: JSON.stringify({
//                 mode: mode,
//                 username: currentUsername,
//                 score: score
//             })
//         });

//         const lbData = await lbResponse.json();
//         if (lbData.status === 'success') {
//             console.log("Leaderboard updated successfully");
//             return true;
//         } else {
//             console.log("Leaderboard not updated:", lbData.message);
//             return false;
//         }
//     } catch (error) {
//         console.error("Error in updateLeaderboard:", error);
//         return false;
//     }
// }
// // After successful login
// async function handleLoginSuccess(userData) {
//     try {
//         // Sign in to Firebase with the custom token
//         const credential = await firebase.auth().signInWithCustomToken(userData.token);
//         currentUserId = credential.user.uid;
//         currentUsername = userData.username;
//         isAuthenticated = true;
        
//         console.log("Firebase auth successful:", currentUserId);
//         updateProfileDisplay();
//     } catch (error) {
//         console.error("Firebase auth failed:", error);
//     }
// }

// function showSelectionScreen(e) {
//     e.preventDefault();
//     gameContent.classList.add('hidden');
//     selectionScreen.classList.remove('hidden');
    
//     // Stop any running game
//     if (window.gameInterval) {
//         clearInterval(window.gameInterval);
//         window.isGameRunning = false;
//     }
    
//     // Stop camera if active
//     if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//         stopCamera();
//     }
// }

//     function highlightUserEntry(userId, expiryTime) {
//         // Find all elements for this user in the leaderboard
//         const userEntries = document.querySelectorAll(`.leaderboard-entry[data-user-id="${userId}"]`);
        
//         // Add highlight class
//         userEntries.forEach(entry => {
//             entry.classList.add('highlighted');
            
//             // Set timeout to remove highlight when session expires
//             const expiryDate = new Date(expiryTime);
//             const now = new Date();
//             const duration = expiryDate - now;
            
//             if (duration > 0) {
//                 setTimeout(() => {
//                     entry.classList.remove('highlighted');
//                 }, duration);
//             }
//         });
//     }

//     function setupLeaderboardButtons() {
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const mode = e.currentTarget.dataset.mode;
//                 switchLeaderboardMode(mode);
//             });
//         });
//     }

//     function switchLeaderboardMode(mode) {
//         currentLeaderboardMode = mode;
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(b => {
//             b.classList.toggle('active', b.dataset.mode === mode);
//         });
//         fetchLeaderboard(mode);
//     }

//     function initializeLeaderboard() {
//         setupLeaderboardButtons();
//         fetchLeaderboard(currentLeaderboardMode);
        
//         // Refresh leaderboard every 30 seconds
//         setInterval(() => {
//             fetchLeaderboard(currentLeaderboardMode);
//         }, 30000);
//     }

//     // Game control handlers
//     keyboardBtn.addEventListener('click', function() {
//          if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//         stopCamera();
//     }
//         currentControlMode = 'keyboard';
//         currentLeaderboardMode = 'keyboard';
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
//         statsHistorySection.classList.remove('hidden');
//         cameraSection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         document.getElementById('game-start').style.display = 'flex';
//         switchLeaderboardMode('keyboard');
//     });
    
//     gestureBtn.addEventListener('click', function() {
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//         stopCamera();
//     }
//         currentControlMode = 'gesture';
//         currentLeaderboardMode = 'gesture';
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');
//         cameraSection.classList.remove('hidden');
//         statsHistorySection.classList.add('hidden');
        
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }
        
//         document.getElementById('game-start').style.display = 'flex';
        
//         if (window.initGestureControls) {
//             initGestureControls();
//         }
        
//         switchLeaderboardMode('gesture');
//     });
//     // Add this with your other event listeners
// if (gameModeBtn) {
//     gameModeBtn.addEventListener('click', function(e) {
//         e.preventDefault();
        
//         // Hide game content and show selection screen
//         gameContent.classList.add('hidden');
//         selectionScreen.classList.remove('hidden');
        
//         // Pause the game if it's running
//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//             window.isGameRunning = false;
//         }
        
//         // If using gesture controls, stop the camera
//         if (currentControlMode === 'gesture' && window.stopCamera) {
//             stopCamera();
//         }
//     });
// }

// if (paletteIcon) {
//     paletteIcon.addEventListener('click', function(e) {
//         e.preventDefault();
//         gameContent.classList.add('hidden');
//         selectionScreen.classList.remove('hidden');
        
//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//             window.isGameRunning = false;
//         }
        
//         if (currentControlMode === 'gesture' && window.stopCamera) {
//             stopCamera();
//         }
//     });
// }
    
//     // Initialize game
//     function initializeGame() {

//         const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {};
//        const GRID_SIZE = 30;
//     const ROWS = settings.rows || 15;
//     const COLS = settings.cols || 15;
//     const GAME_SPEED = settings.snakeSpeedValue || 100;
//     const MAX_HISTORY_ITEMS = 10;
//     const HISTORY_STORAGE_KEY = 'snakeGameHistory';


//      const GRID_COLOR1 = settings.gridColor1 || '#e8f5e9';
//     const GRID_COLOR2 = settings.gridColor2 || '#c8e6c9';
//     const GRID_BORDER_COLOR = settings.gridBorderColor || '#FF0000';
//     const SNAKE_BODY_COLOR = settings.snakeBodyColor || '#4CAF50';
//     const SNAKE_BODY_BORDER = settings.snakeBodyBorder || '#000000';
//     const SNAKE_HEAD_COLOR = settings.snakeHeadColor || '#4CAF50';
//     const SNAKE_HEAD_BORDER = settings.snakeHeadBorder || '#000000';
//     const SNAKE_TAIL_COLOR = settings.snakeTailColor || '#66bb6a';
//     const SNAKE_TAIL_BORDER = settings.snakeTailBorder || '#000000';
//     const FOOD_COLOR = settings.foodColor || '#ff0000';
//     const USE_FOOD_IMAGE = !settings.foodType || settings.foodType === 'image';
    

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

//         const foodImg = new Image();
//         foodImg.src = 'https://cdn-icons-png.flaticon.com/512/3082/3082035.png';

//         function initCanvas() {
//             const container = document.querySelector('.game-board');
//             if (!container) return;

//             const size = Math.min(container.clientWidth, container.clientHeight);
//             canvas.width = COLS * GRID_SIZE;
//             canvas.height = ROWS * GRID_SIZE;
//             canvas.style.width = `${size}px`;
//             canvas.style.height = `${size}px`;
//         }
        
//         function showStartScreen() {
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             if (gameStartScreen) gameStartScreen.style.display = 'flex';
//         }

//         function initGame() {
//             if (gameStartScreen) gameStartScreen.style.display = 'none';
//             if (gameOverScreen) gameOverScreen.style.display = 'none';
//             isGameRunning = true;

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

//         function gameLoop() {
//             if (isPaused || !isGameRunning) return;
//             moveSnake();
//             checkCollision();
//             drawGame();
//         }

//         async function moveSnake() {
//         direction = nextDirection;

//         for (let i = snake.length - 1; i > 0; i--) {
//             snake[i].x = snake[i - 1].x;
//             snake[i].y = snake[i - 1].y;
//         }

//         const head = snake[0];
//         switch (direction) {
//             case 'up': head.y -= GRID_SIZE; break;
//             case 'down': head.y += GRID_SIZE; break;
//             case 'left': head.x -= GRID_SIZE; break;
//             case 'right': head.x += GRID_SIZE; break;
//         }

//         if (head.x === food.x && head.y === food.y) {
//             const tail = snake[snake.length - 1];
//             snake.push({ x: tail.x, y: tail.y });

//             score += 10;
//             if (scoreDisplay) scoreDisplay.textContent = score;
            
//             const isNewHighScore = score > highScore;
//             if (isNewHighScore) {
//                 highScore = score;
//                 if (highScoreDisplay) highScoreDisplay.textContent = highScore;
//                 localStorage.setItem('snakeHighScore', highScore);
                
//                 if (isAuthenticated) {
//                     try {
//                         await updateLeaderboard(highScore, currentControlMode);
//                     } catch (error) {
//                         console.error('Failed to update scores:', error);
//                     }
//                 }
//             }

//             generateFood();
//         }
//     }


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

//         function checkCollision() {
//             const head = snake[0];

//             if (head.x < 0 || head.x >= COLS * GRID_SIZE ||
//                 head.y < 0 || head.y >= ROWS * GRID_SIZE) {
//                 gameOver();
//                 return;
//             }

//             for (let i = 1; i < snake.length; i++) {
//                 if (head.x === snake[i].x && head.y === snake[i].y) {
//                     gameOver();
//                     return;
//                 }
//             }
//         }

//         function gameOver() {
//             clearInterval(gameInterval);
//             if (eventSource) eventSource.close();
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'flex';
            
//             if (score > 0) {
//                 updateHistory(score, currentControlMode);
                
//                 if (isAuthenticated && score <= highScore) {
//                     console.log('Game over, updating leaderboard with current score');
//                     updateLeaderboard(score, currentControlMode);
//                 }
//             }
//         }

//         function updateHistory(newScore, mode) {
//             const historyItem = {
//                 score: newScore,
//                 date: new Date().toLocaleString(),
//                 mode: mode || 'keyboard'
//             };
            
//             scoreHistory.unshift(historyItem);
            
//             if (scoreHistory.length > MAX_HISTORY_ITEMS) {
//                 scoreHistory = scoreHistory.slice(0, MAX_HISTORY_ITEMS);
//             }
            
//             localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(scoreHistory));
//             renderHistory();
//         }

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
//                 const modeIcon = item.mode === 'gesture' ? 
//                     '<i class="fas fa-hand-paper" title="Hand Gesture"></i>' : 
//                     '<i class="fas fa-keyboard" title="Keyboard"></i>';
                
//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${item.score}</td>
//                     <td>${item.date}</td>
//                     <td>${modeIcon}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         }

//             function drawHead(x, y, dir) {
//         ctx.save();
//         ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//         switch (dir) {
//             case 'up': ctx.rotate(-Math.PI / 2); break;
//             case 'down': ctx.rotate(Math.PI / 2); break;
//             case 'left': ctx.rotate(Math.PI); break;
//             case 'right': break;
//         }

//         ctx.beginPath();
//         ctx.roundRect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE, 10);
//         ctx.fillStyle = SNAKE_HEAD_COLOR;
//         ctx.fill();
//         ctx.strokeStyle = SNAKE_HEAD_BORDER;
//         ctx.lineWidth = 1;
//         ctx.stroke();

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

//      function drawTail(x, y, dir) {
//         ctx.save();
//         ctx.translate(x + GRID_SIZE / 2, y + GRID_SIZE / 2);

//         switch (dir) {
//             case 'up': ctx.rotate(0); break;
//             case 'right': ctx.rotate(Math.PI / 2); break;
//             case 'down': ctx.rotate(Math.PI); break;
//             case 'left': ctx.rotate(-Math.PI / 2); break;
//         }

//         ctx.beginPath();
//         ctx.rect(-GRID_SIZE / 2, -GRID_SIZE / 2, GRID_SIZE, GRID_SIZE / 2);
//         ctx.fillStyle = SNAKE_TAIL_COLOR;
//         ctx.fill();
            
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
//             ctx.fillStyle = SNAKE_TAIL_COLOR;
//             ctx.fill();
            
//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.restore();
//         }

//        function drawGame() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         for (let row = 0; row < ROWS; row++) {
//             for (let col = 0; col < COLS; col++) {
//                 ctx.fillStyle = (row + col) % 2 === 0 ? GRID_COLOR1 : GRID_COLOR2;
//                 ctx.fillRect(
//                     col * GRID_SIZE,
//                     row * GRID_SIZE,
//                     GRID_SIZE,
//                     GRID_SIZE
//                 );
//                 ctx.strokeStyle = GRID_BORDER_COLOR;
//                 ctx.lineWidth = .2;
//                 ctx.strokeRect(
//                     col * GRID_SIZE,
//                     row * GRID_SIZE,
//                     GRID_SIZE,
//                     GRID_SIZE
//                 );
//             }
//         }

//         if (USE_FOOD_IMAGE && foodImg.complete) {
//             ctx.drawImage(foodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
//         } else {
//             ctx.fillStyle = FOOD_COLOR;
//             ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
//         }

//         for (let i = 1; i < snake.length - 1; i++) {
//             const segment = snake[i];
//             ctx.fillStyle = SNAKE_BODY_COLOR;
//             ctx.beginPath();
//             ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
//             ctx.fill();
//             ctx.strokeStyle = SNAKE_BODY_BORDER;
//             ctx.lineWidth = 1;
//             ctx.stroke();
//         }

//         if (snake.length > 1) {
//             const tail = snake[snake.length - 1];
//             const tailDir = getSegmentDirection(snake.length - 1);
//             drawTail(tail.x, tail.y, tailDir);
//         }

//         if (snake.length > 0) {
//             const head = snake[0];
//             drawHead(head.x, head.y, direction);
//         }
//     }
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

//         if (startBtn) startBtn.addEventListener('click', initGame);
//         if (restartBtn) restartBtn.addEventListener('click', initGame);

//         initCanvas();
//         window.addEventListener('resize', initCanvas);
//         showStartScreen();
//         renderHistory();
        
//         window.initGestureControls = initGestureControls;
//         document.addEventListener('keydown', handleKeyDown);
//     }
    
//     // Initialize everything
//     initModal();
//     checkAuthState();
//     initializeLeaderboard();
// });







document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDmeALZ7huDbG2ya3Mh9gZ-04wOG-0wRbI",
        authDomain: "hand-snake-game-f3768.firebaseapp.com",
        databaseURL: "https://hand-snake-game-f3768.firebaseio.com",
        projectId: "hand-snake-game-f3768",
        storageBucket: "hand-snake-game-f3768.appspot.com",
        messagingSenderId: "113807589798155426981",
        appId: "1:633783160028:web:e55b0788d0348e89eeb819"
    };
    
    // Initialize Firebase if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Game elements
    const selectionScreen = document.getElementById('selection-screen');
    const gameContent = document.getElementById('game-content');
    const keyboardBtn = document.getElementById('keyboard-btn');
    const gestureBtn = document.getElementById('gesture-btn');
    const cameraSection = document.getElementById('camera-section');
    const statsHistorySection = document.getElementById('stats-history-section');
    const gameModeBtn = document.querySelector('.nav-link .fa-gamepad') ? 
                       document.querySelector('.nav-link .fa-gamepad').closest('.nav-link') : null;
    const paletteIcon = document.querySelector('.game-link .fa-palette') ? 
                       document.querySelector('.game-link .fa-palette').closest('.game-link') : null;
    
    // Auth elements
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileBtn = document.getElementById('profileBtn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    // Game state
    let gameInitialized = false;
    let currentControlMode = null;
    let currentLeaderboardMode = 'keyboard';
    
    // User state
    let currentUserId = null;
    let currentUsername = 'Guest';
    let isAuthenticated = false;

    // Check if mode selection has already been made
    const hasSelectedMode = localStorage.getItem('hasSelectedMode');

    // If mode is already selected, skip the selection screen
    if (hasSelectedMode) {
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        
        // Default to keyboard controls if no specific mode is stored
        currentControlMode = localStorage.getItem('selectedMode') || 'keyboard';
        currentLeaderboardMode = currentControlMode;
        
        // Show/hide appropriate sections based on mode
        if (currentControlMode === 'gesture') {
            cameraSection.classList.remove('hidden');
            statsHistorySection.classList.add('hidden');
            if (window.initGestureControls) {
                initGestureControls();
            }
        } else {
            cameraSection.classList.add('hidden');
            statsHistorySection.classList.remove('hidden');
        }
        
        // Initialize game if not already done
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
        
        // Set up leaderboard for the current mode
        switchLeaderboardMode(currentControlMode);
    }
    
    // Initialize modal handlers
    function initModal() {
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                loginModal.style.display = 'block';
                showLoginForm();
            });
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                loginModal.style.display = 'none';
            });
        }
        
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                showSignupForm();
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                showLoginForm();
            });
        }
        
        function showLoginForm() {
            if (loginForm && signupForm) {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            }
        }
        
        function showSignupForm() {
            if (loginForm && signupForm) {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            }
        }
    }
    
    // Handle authentication
    async function handleLogin(email, password) {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });
            
            if (response.ok) {
                // Get Firebase token after successful login
                const tokenResponse = await fetch('/get_firebase_token');
                const { token } = await tokenResponse.json();
                
                // Sign in to Firebase
                await firebase.auth().signInWithCustomToken(token);
                
                // Now check auth state to update UI
                await checkAuthState();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async function updateUserHighScore(score, mode, idToken) {
        try {
            const response = await fetch('/api/update_user_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    mode: mode,
                    score: score
                })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            if (data.success) {
                console.log('User high score updated successfully');
                return true;
            } else {
                console.log('User high score not updated:', data.message);
                return false;
            }
        } catch (error) {
            console.error('Error updating user high score:', error);
            return false;
        }
    }

    async function handleSignup(username, email, password) {
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
            });
            
            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup error:', error);
            return false;
        }
    }
    
    async function handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            
            if (response.ok) {
                currentUserId = null;
                currentUsername = 'Guest';
                isAuthenticated = false;
                
                updateProfileDisplay();
                fetchLeaderboard(currentLeaderboardMode);
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    }
    
    // Update UI with user info
    function updateProfileDisplay() {
        // Update all username displays
        document.querySelectorAll('.username-display').forEach(el => {
            el.textContent = currentUsername;
        });
        
        // Update profile button if exists
        if (profileBtn) {
            const usernameSpan = profileBtn.querySelector('.username');
            if (usernameSpan) {
                usernameSpan.textContent = currentUsername;
            }
        }
        
        // Toggle login/logout buttons
        if (loginBtn && logoutBtn) {
            loginBtn.style.display = isAuthenticated ? 'none' : 'block';
            logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
        }
    }
    
    // Check auth state on page load
    async function checkAuthState() {
        try {
            // Check Flask session first
            const response = await fetch('/check-auth');
            const data = await response.json();
            
            if (data.authenticated) {
                currentUserId = data.user.uid;
                currentUsername = data.user.display_name;
                isAuthenticated = true;
                
                // Now sync with Firebase
                try {
                    const user = firebase.auth().currentUser;
                    if (!user) {
                        // If no Firebase user but Flask session exists
                        const customTokenResponse = await fetch('/get_firebase_token');
                        const { token } = await customTokenResponse.json();
                        await firebase.auth().signInWithCustomToken(token);
                    }
                } catch (firebaseError) {
                    console.error("Firebase sync error:", firebaseError);
                }
            } else {
                currentUserId = null;
                currentUsername = 'Guest';
                isAuthenticated = false;
            }
            
            updateProfileDisplay();
        } catch (error) {
            console.error('Error checking auth state:', error);
            currentUserId = null;
            currentUsername = 'Guest';
            isAuthenticated = false;
            updateProfileDisplay();
        }
    }
    
    // Leaderboard functions
    function renderLeaderboardEntry(entry, mode) {
        const li = document.createElement('li');
        li.className = 'leaderboard-entry';
        li.dataset.userId = entry.userId;
        
        // Highlight current user
        if (currentUserId && entry.userId === currentUserId) {
            li.classList.add('current-user');
        }
        
        // Highlight active session
        if (entry.in_session) {
            li.classList.add('highlighted');
        }
        
        li.innerHTML = `
            <span class="rank">${entry.rank}.</span>
            <span class="username">${entry.username || 'Anonymous'}</span>
            <span class="score">${entry.score || 0}</span>
        `;
        
        return li;
    }

    async function fetchLeaderboard(mode) {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;
        
        try {
            leaderboardList.innerHTML = '<li class="loading">Loading leaderboard...</li>';
            
            const response = await fetch(`/api/leaderboard?mode=${mode}`);
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid leaderboard data');
            }
            
            leaderboardList.innerHTML = '';
            
            if (data.length === 0) {
                const noScoresItem = document.createElement('li');
                noScoresItem.className = 'no-scores';
                noScoresItem.textContent = 'No scores yet';
                leaderboardList.appendChild(noScoresItem);
                return;
            }
            
            data.forEach((entry) => {
                const li = renderLeaderboardEntry(entry, mode);
                leaderboardList.appendChild(li);
            });
            
            // Update status message
            const statusElement = document.getElementById('leaderboard-status');
            if (statusElement) {
                statusElement.textContent = `Showing ${data.length} top players`;
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            leaderboardList.innerHTML = `
                <li class="error">
                    Failed to load leaderboard: ${error.message}
                    <button onclick="window.fetchLeaderboard('${mode}')">Retry</button>
                </li>
            `;
        }
    }

    // Make the function available globally
    window.fetchLeaderboard = fetchLeaderboard;

    async function updateLeaderboard(score, mode) {
        try {
            // Get the current Firebase user
            const user = firebase.auth().currentUser;
            
            if (!user) {
                console.error("No authenticated user found");
                const auth = await fetch('/check-auth');
                const authData = await auth.json();
                if (authData.authenticated) {
                    console.log("Session exists but Firebase not synced");
                    // Try to refresh Firebase auth
                    await firebase.auth().signOut();
                    const token = await user.getIdToken(true); // Force token refresh
                    return updateLeaderboard(score, mode); // Retry
                }
                return false;
            }

            const idToken = await user.getIdToken();
            console.log("Updating score for user:", user.uid, "Score:", score);

            // Update user's personal high score
            const userResponse = await fetch('/api/update_user_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    mode: mode,
                    score: score
                })
            });

            const userData = await userResponse.json();
            if (!userData.success) {
                console.error("Failed to update user score:", userData.message);
                return false;
            }

            // Update leaderboard
            const lbResponse = await fetch('/api/update_leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    mode: mode,
                    username: currentUsername,
                    score: score
                })
            });

            const lbData = await lbResponse.json();
            if (lbData.status === 'success') {
                console.log("Leaderboard updated successfully");
                return true;
            } else {
                console.log("Leaderboard not updated:", lbData.message);
                return false;
            }
        } catch (error) {
            console.error("Error in updateLeaderboard:", error);
            return false;
        }
    }

    // After successful login
    async function handleLoginSuccess(userData) {
        try {
            // Sign in to Firebase with the custom token
            const credential = await firebase.auth().signInWithCustomToken(userData.token);
            currentUserId = credential.user.uid;
            currentUsername = userData.username;
            isAuthenticated = true;
            
            console.log("Firebase auth successful:", currentUserId);
            updateProfileDisplay();
        } catch (error) {
            console.error("Firebase auth failed:", error);
        }
    }

    function showSelectionScreen(e) {
        e.preventDefault();
        gameContent.classList.add('hidden');
        selectionScreen.classList.remove('hidden');
        
        // Stop any running game
        if (window.gameInterval) {
            clearInterval(window.gameInterval);
            window.isGameRunning = false;
        }
        
        // Stop camera if active
        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
    }

    function highlightUserEntry(userId, expiryTime) {
        // Find all elements for this user in the leaderboard
        const userEntries = document.querySelectorAll(`.leaderboard-entry[data-user-id="${userId}"]`);
        
        // Add highlight class
        userEntries.forEach(entry => {
            entry.classList.add('highlighted');
            
            // Set timeout to remove highlight when session expires
            const expiryDate = new Date(expiryTime);
            const now = new Date();
            const duration = expiryDate - now;
            
            if (duration > 0) {
                setTimeout(() => {
                    entry.classList.remove('highlighted');
                }, duration);
            }
        });
    }

    function setupLeaderboardButtons() {
        document.querySelectorAll('.leaderboard .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = e.currentTarget.dataset.mode;
                switchLeaderboardMode(mode);
            });
        });
    }

    function switchLeaderboardMode(mode) {
        currentLeaderboardMode = mode;
        document.querySelectorAll('.leaderboard .mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });
        fetchLeaderboard(mode);
    }

    function initializeLeaderboard() {
        setupLeaderboardButtons();
        fetchLeaderboard(currentLeaderboardMode);
        
        // Refresh leaderboard every 30 seconds
        setInterval(() => {
            fetchLeaderboard(currentLeaderboardMode);
        }, 30000);
    }

    // Game control handlers
    keyboardBtn.addEventListener('click', function() {
        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
        
        // Store the selection
        localStorage.setItem('hasSelectedMode', 'true');
        localStorage.setItem('selectedMode', 'keyboard');
        
        currentControlMode = 'keyboard';
        currentLeaderboardMode = 'keyboard';
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        statsHistorySection.classList.remove('hidden');
        cameraSection.classList.add('hidden');
        
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
        
        document.getElementById('game-start').style.display = 'flex';
        switchLeaderboardMode('keyboard');
    });
    
    gestureBtn.addEventListener('click', function() {
        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
        
        // Store the selection
        localStorage.setItem('hasSelectedMode', 'true');
        localStorage.setItem('selectedMode', 'gesture');
        
        currentControlMode = 'gesture';
        currentLeaderboardMode = 'gesture';
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');
        cameraSection.classList.remove('hidden');
        statsHistorySection.classList.add('hidden');
        
        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }
        
        document.getElementById('game-start').style.display = 'flex';
        
        if (window.initGestureControls) {
            initGestureControls();
        }
        
        switchLeaderboardMode('gesture');
    });

    if (gameModeBtn) {
        gameModeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear the stored selection to show the mode selection screen again
            localStorage.removeItem('hasSelectedMode');
            
            // Hide game content and show selection screen
            gameContent.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
            
            // Pause the game if it's running
            if (window.gameInterval) {
                clearInterval(window.gameInterval);
                window.isGameRunning = false;
            }
            
            // If using gesture controls, stop the camera
            if (currentControlMode === 'gesture' && window.stopCamera) {
                stopCamera();
            }
        });
    }

    if (paletteIcon) {
        paletteIcon.addEventListener('click', function(e) {
            e.preventDefault();
            gameContent.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
            
            if (window.gameInterval) {
                clearInterval(window.gameInterval);
                window.isGameRunning = false;
            }
            
            if (currentControlMode === 'gesture' && window.stopCamera) {
                stopCamera();
            }
        });
    }
    
    // Initialize game
    function initializeGame() {
        const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {};
        const GRID_SIZE = 30;
        const ROWS = settings.rows || 15;
        const COLS = settings.cols || 15;
        const GAME_SPEED = settings.snakeSpeedValue || 100;
        const MAX_HISTORY_ITEMS = 10;
        const HISTORY_STORAGE_KEY = 'snakeGameHistory';

        const GRID_COLOR1 = settings.gridColor1 || '#e8f5e9';
        const GRID_COLOR2 = settings.gridColor2 || '#c8e6c9';
        const GRID_BORDER_COLOR = settings.gridBorderColor || '#FF0000';
        const SNAKE_BODY_COLOR = settings.snakeBodyColor || '#4CAF50';
        const SNAKE_BODY_BORDER = settings.snakeBodyBorder || '#000000';
        const SNAKE_HEAD_COLOR = settings.snakeHeadColor || '#4CAF50';
        const SNAKE_HEAD_BORDER = settings.snakeHeadBorder || '#000000';
        const SNAKE_TAIL_COLOR = settings.snakeTailColor || '#66bb6a';
        const SNAKE_TAIL_BORDER = settings.snakeTailBorder || '#000000';
        const FOOD_COLOR = settings.foodColor || '#ff0000';
        const USE_FOOD_IMAGE = !settings.foodType || settings.foodType === 'image';
        
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

        const foodImg = new Image();
        foodImg.src = 'https://cdn-icons-png.flaticon.com/512/3082/3082035.png';

        function initCanvas() {
            const container = document.querySelector('.game-board');
            if (!container) return;

            const size = Math.min(container.clientWidth, container.clientHeight);
            canvas.width = COLS * GRID_SIZE;
            canvas.height = ROWS * GRID_SIZE;
            canvas.style.width = `${size}px`;
            canvas.style.height = `${size}px`;
        }
        
        function showStartScreen() {
            isGameRunning = false;
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            if (gameStartScreen) gameStartScreen.style.display = 'flex';
        }

        function initGame() {
            if (gameStartScreen) gameStartScreen.style.display = 'none';
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            isGameRunning = true;

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

        function gameLoop() {
            if (isPaused || !isGameRunning) return;
            moveSnake();
            checkCollision();
            drawGame();
        }

        async function moveSnake() {
            direction = nextDirection;

            for (let i = snake.length - 1; i > 0; i--) {
                snake[i].x = snake[i - 1].x;
                snake[i].y = snake[i - 1].y;
            }

            const head = snake[0];
            switch (direction) {
                case 'up': head.y -= GRID_SIZE; break;
                case 'down': head.y += GRID_SIZE; break;
                case 'left': head.x -= GRID_SIZE; break;
                case 'right': head.x += GRID_SIZE; break;
            }

            if (head.x === food.x && head.y === food.y) {
                const tail = snake[snake.length - 1];
                snake.push({ x: tail.x, y: tail.y });

                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = score;
                
                const isNewHighScore = score > highScore;
                if (isNewHighScore) {
                    highScore = score;
                    if (highScoreDisplay) highScoreDisplay.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                    
                    if (isAuthenticated) {
                        try {
                            await updateLeaderboard(highScore, currentControlMode);
                        } catch (error) {
                            console.error('Failed to update scores:', error);
                        }
                    }
                }

                generateFood();
            }
        }

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

        function checkCollision() {
            const head = snake[0];

            if (head.x < 0 || head.x >= COLS * GRID_SIZE ||
                head.y < 0 || head.y >= ROWS * GRID_SIZE) {
                gameOver();
                return;
            }

            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    gameOver();
                    return;
                }
            }
        }

        function gameOver() {
            clearInterval(gameInterval);
            if (eventSource) eventSource.close();
            isGameRunning = false;
            if (gameOverScreen) gameOverScreen.style.display = 'flex';
            
            if (score > 0) {
                updateHistory(score, currentControlMode);
                
                if (isAuthenticated && score <= highScore) {
                    console.log('Game over, updating leaderboard with current score');
                    updateLeaderboard(score, currentControlMode);
                }
            }
        }

        function updateHistory(newScore, mode) {
            const historyItem = {
                score: newScore,
                date: new Date().toLocaleString(),
                mode: mode || 'keyboard'
            };
            
            scoreHistory.unshift(historyItem);
            
            if (scoreHistory.length > MAX_HISTORY_ITEMS) {
                scoreHistory = scoreHistory.slice(0, MAX_HISTORY_ITEMS);
            }
            
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(scoreHistory));
            renderHistory();
        }

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
            ctx.fillStyle = SNAKE_HEAD_COLOR;
            ctx.fill();
            ctx.strokeStyle = SNAKE_HEAD_BORDER;
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
            ctx.fillStyle = SNAKE_TAIL_COLOR;
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
            ctx.fillStyle = SNAKE_TAIL_COLOR;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    ctx.fillStyle = (row + col) % 2 === 0 ? GRID_COLOR1 : GRID_COLOR2;
                    ctx.fillRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                    ctx.strokeStyle = GRID_BORDER_COLOR;
                    ctx.lineWidth = .2;
                    ctx.strokeRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                }
            }

            if (USE_FOOD_IMAGE && foodImg.complete) {
                ctx.drawImage(foodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
            } else {
                ctx.fillStyle = FOOD_COLOR;
                ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
            }

            for (let i = 1; i < snake.length - 1; i++) {
                const segment = snake[i];
                ctx.fillStyle = SNAKE_BODY_COLOR;
                ctx.beginPath();
                ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
                ctx.fill();
                ctx.strokeStyle = SNAKE_BODY_BORDER;
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

        if (startBtn) startBtn.addEventListener('click', initGame);
        if (restartBtn) restartBtn.addEventListener('click', initGame);

        initCanvas();
        window.addEventListener('resize', initCanvas);
        showStartScreen();
        renderHistory();
        
        window.initGestureControls = initGestureControls;
        document.addEventListener('keydown', handleKeyDown);
    }
    
    // Initialize everything
    initModal();
    checkAuthState();
    initializeLeaderboard();
});