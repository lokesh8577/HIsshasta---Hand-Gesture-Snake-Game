// document.addEventListener('DOMContentLoaded', function () {
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
//     const gameModeBtn = document.querySelector('.nav-link .fa-gamepad') ?
//         document.querySelector('.nav-link .fa-gamepad').closest('.nav-link') : null;
//     const paletteIcon = document.querySelector('.game-link .fa-palette') ?
//         document.querySelector('.game-link .fa-palette').closest('.game-link') : null;

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


//     let gameSettings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {
//         grid: { size: 'medium', customSize: 15 },
//         snake: { speed: 100, growthRate: 1 },
//         food: { type: 'apple' },
//         controls: {
//             method: 'keyboard',
//             keyBindings: {
//                 up: 'ArrowUp',
//                 down: 'ArrowDown',
//                 left: 'ArrowLeft',
//                 right: 'ArrowRight',
//                 pause: 'Space'
//             }
//         }
//     };

//     const FOOD_IMAGES = {
//         apple: '/static/img/apple.png',
//         banana: '/static/img/banana.png',
//         cherry: '/static/img/cherries.png',
//         grape: '/static/img/grapes.png',
//         orange: '/static/img/orange.png',
//         strawberry: '/static/img/strawberry.png',
//         watermelon: '/static/img/watermelon.png'
//     };

//     let foodImages = {}; // Will store loaded images
//     let currentFoodImg = null; // Currently displayed food image
//     let foodLoaded = false;



//     // Check if mode selection has already been made
//     const hasSelectedMode = localStorage.getItem('hasSelectedMode');
//     const storedMode = localStorage.getItem('selectedMode') || 'keyboard';
//     if (storedMode === 'gesture') {
//         document.body.classList.add('gesture-mode');
//     } else {
//         document.body.classList.remove('gesture-mode');
//     }

//     // If mode is already selected, skip the selection screen
//     if (hasSelectedMode) {
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');

//         currentControlMode = storedMode;
//         currentLeaderboardMode = storedMode;

//         // Show/hide appropriate sections based on mode
//         if (currentControlMode === 'gesture') {
//             cameraSection.classList.remove('hidden');
//             statsHistorySection.classList.add('hidden');
//             if (window.initGestureControls) {
//                 initGestureControls();
//             }
//         } else {
//             cameraSection.classList.add('hidden');
//             statsHistorySection.classList.remove('hidden');
//         }

//         // Initialize game if not already done
//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }

//         // Set up leaderboard for the current mode
//         switchLeaderboardMode(currentControlMode);
//         updateControlGuide(storedMode);
//     }
//     function preloadFoodImages() {
//         foodLoaded = false;
//         let loadedCount = 0;
//         const totalImages = Object.keys(FOOD_IMAGES).length;

//         for (const [key, url] of Object.entries(FOOD_IMAGES)) {
//             foodImages[key] = new Image();
//             foodImages[key].onload = () => {
//                 loadedCount++;
//                 if (loadedCount === totalImages) {
//                     foodLoaded = true;
//                     currentFoodImg = foodImages.apple;
//                 }
//             };
//             foodImages[key].onerror = () => {
//                 console.error(`Failed to load food image: ${key}`);
//                 loadedCount++;
//                 if (!foodImages.apple) foodImages.apple = new Image();
//                 foodImages.apple.src = FOOD_IMAGES.apple;
//             };
//             foodImages[key].src = url;
//         }
//     }


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


//     // Handle login
//     async function handleLogin(email, password) {
//         try {
//             const response = await fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
//             });

//             if (response.ok) {
//                 const tokenResponse = await fetch('/get_firebase_token');
//                 const { token } = await tokenResponse.json();

//                 await firebase.auth().signInWithCustomToken(token);
//                 await checkAuthState();
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Login error:', error);
//             return false;
//         }
//     }

//     // Handle signup
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

//         // Handle logout
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

//        // Update UI with user info
//     function updateProfileDisplay() {
//         document.querySelectorAll('.username-display').forEach(el => {
//             el.textContent = currentUsername;
//         });

//         if (profileBtn) {
//             const usernameSpan = profileBtn.querySelector('.username');
//             if (usernameSpan) {
//                 usernameSpan.textContent = currentUsername;
//             }
//         }

//         if (loginBtn && logoutBtn) {
//             loginBtn.style.display = isAuthenticated ? 'none' : 'block';
//             logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
//         }
//     }
//       // Check auth state
//     async function checkAuthState() {
//         try {
//             const response = await fetch('/check-auth');
//             const data = await response.json();

//             if (data.authenticated) {
//                 currentUserId = data.user.uid;
//                 currentUsername = data.user.display_name;
//                 isAuthenticated = true;

//                 try {
//                     const user = firebase.auth().currentUser;
//                     if (!user) {
//                         const customTokenResponse = await fetch('/get_firebase_token');
//                         const { token } = await customTokenResponse.json();
//                         await firebase.auth().signInWithCustomToken(token);
//                     }
//                 } catch (firebaseError) {
//                     console.error("Firebase sync error:", firebaseError);
//                 }
//             } else {
//                 currentUserId = null;
//                 currentUsername = 'Guest';
//                 isAuthenticated = false;
//             }

//             updateProfileDisplay();
//         } catch (error) {
//             console.error('Error checking auth state:', error);
//             currentUserId = null;
//             currentUsername = 'Guest';
//             isAuthenticated = false;
//             updateProfileDisplay();
//         }
//     }

//       // Render leaderboard entry
//     function renderLeaderboardEntry(entry, mode) {
//         const li = document.createElement('li');
//         li.className = 'leaderboard-entry';
//         li.dataset.userId = entry.userId;

//         if (currentUserId && entry.userId === currentUserId) {
//             li.classList.add('current-user');
//         }

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
//         } catch {
//             console.error('Signup error:', error);
//             return false;
//         }
//     }
//       // Show toast message
//     function showToast(message) {
//         const toast = document.createElement('div');
//         toast.className = 'toast show';
//         toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
//         document.body.appendChild(toast);

//         setTimeout(() => {
//             toast.classList.remove('show');
//             setTimeout(() => toast.remove(), 300);
//         }, 3000);
//     }

//       // Fetch leaderboard
//     async function fetchLeaderboard(mode) {
//         const leaderboardList = document.getElementById('leaderboard-list');
//         if (!leaderboardList) return;

//         try {
//             leaderboardList.innerHTML = '<li class="loading">Loading leaderboard...</li>';

//             const response = await fetch(`/api/leaderboard?mode=${mode}`);

//             if (!response.ok) {
//                 throw new Error(`Server returned ${response.status}`);
//             }

//             const data = await response.json();

//             if (!Array.isArray(data)) {
//                 throw new Error('Invalid leaderboard data');
//             }

//             leaderboardList.innerHTML = '';

//             if (data.length === 0) {
//                 const noScoresItem = document.createElement('li');
//                 noScoresItem.className = 'no-scores';
//                 noScoresItem.textContent = 'No scores yet';
//                 leaderboardList.appendChild(noScoresItem);
//                 return;
//             }

//             data.forEach((entry) => {
//                 const li = renderLeaderboardEntry(entry, mode);
//                 leaderboardList.appendChild(li);
//             });

//             const statusElement = document.getElementById('leaderboard-status');
//             if (statusElement) {
//                 statusElement.textContent = `Showing ${data.length} top players`;
//             }
//         } catch (error) {
//             console.error('Error fetching leaderboard:', error);
//             leaderboardList.innerHTML = `
//                 <li class="error">
//                     Failed to load leaderboard: ${error.message}
//                     <button onclick="window.fetchLeaderboard('${mode}')">Retry</button>
//                 </li>
//             `;
//         }
//     }


//     // Update leaderboard
//     async function updateLeaderboard(score, mode) {
//         try {
//             const user = firebase.auth().currentUser;

//             if (!user) {
//                 console.error("No authenticated user found");
//                 const auth = await fetch('/check-auth');
//                 const authData = await auth.json();
//                 if (authData.authenticated) {
//                     console.log("Session exists but Firebase not synced");
//                     await firebase.auth().signOut();
//                     const token = await user.getIdToken(true);
//                     return updateLeaderboard(score, mode);
//                 }
//                 return false;
//             }

//             const idToken = await user.getIdToken();
//             console.log("Updating score for user:", user.uid, "Score:", score);

//             const userResponse = await fetch('/api/update_user_score', {
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

//             const userData = await userResponse.json();
//             if (!userData.success) {
//                 console.error("Failed to update user score:", userData.message);
//                 return false;
//             }

//             const lbResponse = await fetch('/api/update_leaderboard', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${idToken}`
//                 },
//                 body: JSON.stringify({
//                     mode: mode,
//                     username: currentUsername,
//                     score: score
//                 })
//             });

//             const lbData = await lbResponse.json();
//             if (lbData.status === 'success') {
//                 console.log("Leaderboard updated successfully");
//                 return true;
//             } else {
//                 console.log("Leaderboard not updated:", lbData.message);
//                 return false;
//             }
//         } catch (error) {
//             console.error("Error in updateLeaderboard:", error);
//             return false;
//         }
//     }


//     // Highlight user entry in leaderboard
//     function highlightUserEntry(userId, expiryTime) {
//         const userEntries = document.querySelectorAll(`.leaderboard-entry[data-user-id="${userId}"]`);

//         userEntries.forEach(entry => {
//             entry.classList.add('highlighted');

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

//      // Setup leaderboard buttons
//     function setupLeaderboardButtons() {
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const mode = e.currentTarget.dataset.mode;
//                 switchLeaderboardMode(mode);
//             });
//         });
//     }


//     // Switch leaderboard mode
//     function switchLeaderboardMode(mode) {
//         currentLeaderboardMode = mode;
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(b => {
//             b.classList.toggle('active', b.dataset.mode === mode);
//         });
//         fetchLeaderboard(mode);
//     }

//  // Initialize leaderboard
//     function initializeLeaderboard() {
//         setupLeaderboardButtons();
//         fetchLeaderboard(currentLeaderboardMode);

//         setInterval(() => {
//             fetchLeaderboard(currentLeaderboardMode);
//         }, 30000);
//     }

//      // Update control guide
//     function updateControlGuide(mode) {
//         document.querySelectorAll('.control-guide').forEach(guide => {
//             guide.style.display = 'none';
//         });

//         if (mode === 'keyboard') {
//             document.getElementById('keyboard-guide').style.display = 'block';
//             document.querySelector('.gesture-display').style.display = 'none';
//         } else if (mode === 'gesture') {
//             document.getElementById('gesture-guide').style.display = 'block';
//             document.querySelector('.gesture-display').style.display = 'block';
//         }
//     }

//     // After successful login
//     async function handleLoginSuccess(userData) {
//         try {
//             // Sign in to Firebase with the custom token
//             const credential = await firebase.auth().signInWithCustomToken(userData.token);
//             currentUserId = credential.user.uid;
//             currentUsername = userData.username;
//             isAuthenticated = true;

//             console.log("Firebase auth successful:", currentUserId);
//             updateProfileDisplay();
//         } catch (error) {
//             console.error("Firebase auth failed:", error);
//         }
//     }

//     function showSelectionScreen(e) {
//         e.preventDefault();
//         gameContent.classList.add('hidden');
//         selectionScreen.classList.remove('hidden');

//         // Stop any running game
//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//             window.isGameRunning = false;
//         }

//         // Stop camera if active
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//     }





//     // Game control handlers
//     keyboardBtn.addEventListener('click', function () {
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//         updateControlGuide('keyboard');
//         document.body.classList.remove('gesture-mode');

//         // Store the selection
//         localStorage.setItem('hasSelectedMode', 'true');
//         localStorage.setItem('selectedMode', 'keyboard');

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

//     gestureBtn.addEventListener('click', function () {
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//         updateControlGuide('gesture');
//         document.body.classList.add('gesture-mode');

//         // Store the selection
//         localStorage.setItem('hasSelectedMode', 'true');
//         localStorage.setItem('selectedMode', 'gesture');

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

//     if (gameModeBtn) {
//         gameModeBtn.addEventListener('click', function (e) {
//             e.preventDefault();

//             // Clear the stored selection to show the mode selection screen again
//             localStorage.removeItem('hasSelectedMode');

//             // Hide game content and show selection screen
//             gameContent.classList.add('hidden');
//             selectionScreen.classList.remove('hidden');

//             // Pause the game if it's running
//             if (window.gameInterval) {
//                 clearInterval(window.gameInterval);
//                 window.isGameRunning = false;
//             }

//             // If using gesture controls, stop the camera
//             if (currentControlMode === 'gesture' && window.stopCamera) {
//                 stopCamera();
//             }
//         });
//     }

//     if (paletteIcon) {
//         paletteIcon.addEventListener('click', function (e) {
//             e.preventDefault();
//             gameContent.classList.add('hidden');
//             selectionScreen.classList.remove('hidden');

//             if (window.gameInterval) {
//                 clearInterval(window.gameInterval);
//                 window.isGameRunning = false;
//             }

//             if (currentControlMode === 'gesture' && window.stopCamera) {
//                 stopCamera();
//             }
//         });
//     }

//     // Initialize game
//     function initializeGame() {
//         const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || gameSettings;

//         let gridSize;
//         switch (settings.grid.size) {
//             case 'small': gridSize = 12; break;
//             case 'large': gridSize = 20; break;
//             case 'custom': gridSize = settings.grid.customSize; break;
//             default: gridSize = 15;
//         }

//         const GRID_SIZE = 30;
//         const ROWS = gridSize;
//         const COLS = gridSize;
//         const GAME_SPEED = settings.snake.speed;
//         const GROWTH_RATE = settings.snake.growthRate;
//         const FOOD_TYPE = settings.food.type;
//         const CONTROL_METHOD = settings.controls.method;
//         const KEY_BINDINGS = settings.controls.keyBindings;
//         const MAX_HISTORY_ITEMS = 10;
//         const HISTORY_STORAGE_KEY = 'snakeGameHistory';

//         const GRID_COLOR1 = getComputedStyle(document.documentElement).getPropertyValue('--grid1').trim() || '#e8f5e9';
//         const GRID_COLOR2 = getComputedStyle(document.documentElement).getPropertyValue('--grid2').trim() || '#c8e6c9';
//         const SNAKE_BODY_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
//         const SNAKE_BODY_BORDER = '#000000';
//         const SNAKE_HEAD_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
//         const SNAKE_HEAD_BORDER = '#000000';
//         const SNAKE_TAIL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#66bb6a';
//         const SNAKE_TAIL_BORDER = '#000000';
//         const FOOD_COLOR = settings.foodColor || '#ff0000';

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
//         let score = 0;
//         let highScore = localStorage.getItem('snakeHighScore') || 0;
//         let isPaused = false;
//         let isGameRunning = false;
//         let lastGesture = '';
//         let eventSource = null;
//         let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
//         let lastFrameTime = 0;
//         let accumulatedTime = 0;
//         let lastDirectionChangeTime = 0;
//         let directionChangeCooldown = 50;

//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//         }

//         // Optimized game loop
//         function gameLoop(timestamp) {
//             if (!isGameRunning) return;

//             const deltaTime = timestamp - lastFrameTime;
//             lastFrameTime = timestamp;
//             accumulatedTime += deltaTime;

//             if (accumulatedTime >= GAME_SPEED) {
//                 if (!isPaused) {
//                     moveSnake();
//                     checkCollision();
//                 }
//                 drawGame();
//                 accumulatedTime = 0;
//             }

//             requestAnimationFrame(gameLoop);
//         }

//         // Initialize canvas
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

//         // Start game
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

//             lastFrameTime = performance.now();
//             accumulatedTime = 0;
//             requestAnimationFrame(gameLoop);
//         }

//         // Move snake
//         function moveSnake() {
//             if (direction !== nextDirection) {
//                 direction = nextDirection;
//             }

//             for (let i = snake.length - 1; i > 0; i--) {
//                 snake[i].x = snake[i - 1].x;
//                 snake[i].y = snake[i - 1].y;
//             }

//             const head = snake[0];
//             switch (direction) {
//                 case 'up': head.y -= GRID_SIZE; break;
//                 case 'down': head.y += GRID_SIZE; break;
//                 case 'left': head.x -= GRID_SIZE; break;
//                 case 'right': head.x += GRID_SIZE; break;
//             }

//             if (head.x === food.x && head.y === food.y) {
//                 soundManager.playPoint();
//                 for (let i = 0; i < GROWTH_RATE; i++) {
//                     const tail = snake[snake.length - 1];
//                     snake.push({ x: tail.x, y: tail.y });
//                 }

//                 score += 10;
//                 if (scoreDisplay) scoreDisplay.textContent = score;

//                 const isNewHighScore = score > highScore;
//                 if (isNewHighScore) {
//                     highScore = score;
//                     if (highScoreDisplay) highScoreDisplay.textContent = highScore;
//                     localStorage.setItem('snakeHighScore', highScore);
//                 }

//                 generateFood();
//             }
//         }

//         // Check collisions
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

//         // Generate food
//         function generateFood() {
//             let foodX, foodY;
//             let validPosition = false;
//             let attempts = 0;
//             const maxAttempts = 100;

//             while (!validPosition && attempts < maxAttempts) {
//                 attempts++;
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

//             if (validPosition) {
//                 food = { x: foodX, y: foodY };

//                 if (FOOD_TYPE === 'random') {
//                     const foodKeys = Object.keys(FOOD_IMAGES).filter(key => key !== 'random');
//                     const randomKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
//                     currentFoodImg = foodImages[randomKey];
//                 } else {
//                     currentFoodImg = foodImages[FOOD_TYPE] || foodImages.apple;
//                 }
//             } else {
//                 console.warn('Failed to find valid food position after', maxAttempts, 'attempts');

//                 let foundSpot = false;
//                 for (let y = 0; y < ROWS && !foundSpot; y++) {
//                     for (let x = 0; x < COLS && !foundSpot; x++) {
//                         const testX = x * GRID_SIZE;
//                         const testY = y * GRID_SIZE;
//                         let spotValid = true;

//                         for (const segment of snake) {
//                             if (segment.x === testX && segment.y === testY) {
//                                 spotValid = false;
//                                 break;
//                             }
//                         }

//                         if (spotValid) {
//                             foodX = testX;
//                             foodY = testY;
//                             foundSpot = true;
//                         }
//                     }
//                 }

//                 if (foundSpot) {
//                     food = { x: foodX, y: foodY };
//                     currentFoodImg = foodImages[FOOD_TYPE === 'random' ? 'apple' : FOOD_TYPE] || foodImages.apple;
//                 } else {
//                     console.error('Could not find any valid food position');
//                     food = {
//                         x: Math.floor(COLS / 2) * GRID_SIZE,
//                         y: Math.floor(ROWS / 2) * GRID_SIZE
//                     };
//                     currentFoodImg = foodImages.apple;
//                 }
//             }
//         }

//         // Game over
//         function gameOver() {
//             soundManager.playGameOver();
//             cancelAnimationFrame(gameLoop);
//             if (eventSource) eventSource.close();
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'flex';

//             if (score > 0) {
//                 updateHistory(score, currentControlMode);

//                 if (isAuthenticated && score <= highScore) {
//                     updateLeaderboard(score, currentControlMode);
//                 }
//             }
//         }

//         // Update history
//         function updateHistory(newScore, mode) {
//             const historyItem = {
//                 score: newScore,
//                 date: new Date().toISOString(),
//                 mode: mode || 'keyboard'
//             };

//             let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

//             history.unshift(historyItem);

//             localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

//             const updateEvent = new CustomEvent('historyUpdated', {
//                 detail: { history }
//             });
//             window.dispatchEvent(updateEvent);

//             renderHistory();
//         }

//         // Render history
//         function renderHistory() {
//             const tableBody = document.getElementById('history-table-body');
//             if (!tableBody) return;

//             let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
//             const displayHistory = window.location.pathname.includes('history.html') ?
//                 history : history.slice(0, 10);

//             tableBody.innerHTML = '';

//             if (displayHistory.length === 0) {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
//                 tableBody.appendChild(row);
//                 return;
//             }

//             displayHistory.forEach((item, index) => {
//                 const row = document.createElement('tr');
//                 const modeIcon = item.mode === 'gesture' ?
//                     '<i class="fas fa-hand-paper" title="Hand Gesture"></i>' :
//                     '<i class="fas fa-keyboard" title="Keyboard"></i>';

//                 let formattedDate;
//                 try {
//                     const dateObj = new Date(item.date);
//                     formattedDate = dateObj.toLocaleString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     });
//                 } catch (e) {
//                     formattedDate = 'Unknown date';
//                 }

//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${item.score}</td>
//                     <td>${formattedDate}</td>
//                     <td>${modeIcon}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         }

//         // Draw game
//         function drawGame() {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             for (let row = 0; row < ROWS; row++) {
//                 for (let col = 0; col < COLS; col++) {
//                     ctx.fillStyle = (row + col) % 2 === 0 ? GRID_COLOR1 : GRID_COLOR2;
//                     ctx.fillRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                     ctx.lineWidth = .2;
//                     ctx.strokeRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                 }
//             }

//             if (foodLoaded && currentFoodImg) {
//                 try {
//                     ctx.drawImage(currentFoodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
//                 } catch (e) {
//                     console.error('Error drawing food:', e);
//                     ctx.fillStyle = '#ff0000';
//                     ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
//                 }
//             }

//             for (let i = 1; i < snake.length - 1; i++) {
//                 const segment = snake[i];
//                 ctx.fillStyle = SNAKE_BODY_COLOR;
//                 ctx.beginPath();
//                 ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
//                 ctx.fill();
//                 ctx.strokeStyle = SNAKE_BODY_BORDER;
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

//         // Get segment direction
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

//         // Draw head
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
//             ctx.fillStyle = SNAKE_HEAD_COLOR;
//             ctx.fill();
//             ctx.strokeStyle = SNAKE_HEAD_BORDER;
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

//         // Draw tail
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
//             ctx.fillStyle = SNAKE_TAIL_COLOR;
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
//             ctx.fillStyle = SNAKE_TAIL_COLOR;
//             ctx.fill();

//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.restore();
//         }

//         // Handle gesture input
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

//         // Initialize gesture controls
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

//         // Handle keyboard input
//         function handleKeyDown(e) {
//             if (!isGameRunning || currentControlMode !== 'keyboard') return;

//             const now = performance.now();
//             if (now - lastDirectionChangeTime < directionChangeCooldown) return;

//             if ([KEY_BINDINGS.up, KEY_BINDINGS.down, KEY_BINDINGS.left, KEY_BINDINGS.right].includes(e.key)) {
//                 e.preventDefault();
//             }

//             if (e.key === KEY_BINDINGS.up && direction !== 'down') {
//                 nextDirection = 'up';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.down && direction !== 'up') {
//                 nextDirection = 'down';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.left && direction !== 'right') {
//                 nextDirection = 'left';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.right && direction !== 'left') {
//                 nextDirection = 'right';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.pause) {
//                 isPaused = !isPaused;
//             }
//         }

//         // Setup swipe controls for mobile
//         function setupSwipeControls() {
//             const gameBoard = document.querySelector('.game-board');
//             if (!gameBoard) return;

//             let touchStartX = 0;
//             let touchStartY = 0;
//             let touchEndX = 0;
//             let touchEndY = 0;
//             const minSwipeDistance = 30;

//             gameBoard.addEventListener('touchstart', (e) => {
//                 const touch = e.touches[0];
//                 touchStartX = touch.clientX;
//                 touchStartY = touch.clientY;
//             });

//             gameBoard.addEventListener('touchend', (e) => {
//                 if (!isGameRunning || currentControlMode !== 'keyboard') return;

//                 const touch = e.changedTouches[0];
//                 touchEndX = touch.clientX;
//                 touchEndY = touch.clientY;

//                 const deltaX = touchEndX - touchStartX;
//                 const deltaY = touchEndY - touchStartY;
//                 const absDeltaX = Math.abs(deltaX);
//                 const absDeltaY = Math.abs(deltaY);

//                 if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) return;

//                 if (absDeltaX > absDeltaY) {
//                     if (deltaX > 0 && direction !== 'left') {
//                         nextDirection = 'right';
//                     } else if (deltaX < 0 && direction !== 'right') {
//                         nextDirection = 'left';
//                     }
//                 } else {
//                     if (deltaY > 0 && direction !== 'up') {
//                         nextDirection = 'down';
//                     } else if (deltaY < 0 && direction !== 'down') {
//                         nextDirection = 'up';
//                     }
//                 }
//             });

//             let lastTapTime = 0;
//             const doubleTapDelay = 300;

//             gameBoard.addEventListener('touchend', (e) => {
//                 if (!isGameRunning) return;

//                 const currentTime = new Date().getTime();
//                 const tapTimeDiff = currentTime - lastTapTime;

//                 if (tapTimeDiff < doubleTapDelay && tapTimeDiff > 0) {
//                     isPaused = !isPaused;
//                 }

//                 lastTapTime = currentTime;
//             });
//         }

//         // Initialize everything
//         initCanvas();
//         window.addEventListener('resize', initCanvas);

//         if (startBtn) startBtn.addEventListener('click', initGame);
//         if (restartBtn) restartBtn.addEventListener('click', initGame);

//         window.addEventListener('settingsUpdated', (event) => {
//             showToast('New settings applied!');
//             initializeGame();
//         });

//         window.initGestureControls = initGestureControls;
//         document.addEventListener('keydown', handleKeyDown);
//         setupSwipeControls();

//         showStartScreen();
//         renderHistory();
//     }

//     // Make fetchLeaderboard available globally
//     window.fetchLeaderboard = fetchLeaderboard;

//     // Initialize everything
//     initModal();
//     checkAuthState();
//     initializeLeaderboard();
//     preloadFoodImages();
// });

























































































// import './sound.js';
// document.addEventListener('DOMContentLoaded', function () {

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
//     const gameModeBtn = document.querySelector('.nav-link .fa-gamepad') ?
//         document.querySelector('.nav-link .fa-gamepad').closest('.nav-link') : null;
//     const paletteIcon = document.querySelector('.game-link .fa-palette') ?
//         document.querySelector('.game-link .fa-palette').closest('.game-link') : null;

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


//     let gameSettings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {
//         grid: { size: 'medium', customSize: 15 },
//         snake: { speed: 100, growthRate: 1 },
//         food: { type: 'apple' },
//         controls: {
//             method: 'keyboard',
//             keyBindings: {
//                 up: 'ArrowUp',
//                 down: 'ArrowDown',
//                 left: 'ArrowLeft',
//                 right: 'ArrowRight',
//                 pause: 'Space'
//             }
//         }
//     };


//     const FOOD_IMAGES = {
//         apple: '/static/img/apple.png',
//         banana: '/static/img/banana.png',
//         cherry: '/static/img/cherries.png',
//         grape: '/static/img/grapes.png',
//         orange: '/static/img/orange.png',
//         strawberry: '/static/img/strawberry.png',
//         watermelon: '/static/img/watermelon.png'
//     };

//     let foodImages = {};
//     let currentFoodImg = null;
//     let foodLoaded = false;

//     // Check if mode selection has already been made
//     const hasSelectedMode = localStorage.getItem('hasSelectedMode');
//     const storedMode = localStorage.getItem('selectedMode') || 'keyboard';
//     if (storedMode === 'gesture') {
//         document.body.classList.add('gesture-mode');
//     } else {
//         document.body.classList.remove('gesture-mode');
//     }

//     // If mode is already selected, skip the selection screen
//     if (hasSelectedMode) {
//         selectionScreen.classList.add('hidden');
//         gameContent.classList.remove('hidden');

//         currentControlMode = storedMode;
//         currentLeaderboardMode = storedMode;

//         if (currentControlMode === 'gesture') {
//             cameraSection.classList.remove('hidden');
//             statsHistorySection.classList.add('hidden');
//             if (window.initGestureControls) {
//                 initGestureControls();
//             }
//         } else {
//             cameraSection.classList.add('hidden');
//             statsHistorySection.classList.remove('hidden');
//         }

//         if (!gameInitialized) {
//             initializeGame();
//             gameInitialized = true;
//         }

//         switchLeaderboardMode(currentControlMode);
//         updateControlGuide(storedMode);
//     }

//     // Preload food images
//     function preloadFoodImages() {
//         foodLoaded = false;
//         let loadedCount = 0;
//         const totalImages = Object.keys(FOOD_IMAGES).length;

//         for (const [key, url] of Object.entries(FOOD_IMAGES)) {
//             foodImages[key] = new Image();
//             foodImages[key].onload = () => {
//                 loadedCount++;
//                 if (loadedCount === totalImages) {
//                     foodLoaded = true;
//                     currentFoodImg = foodImages.apple;
//                 }
//             };
//             foodImages[key].onerror = () => {
//                 console.error(`Failed to load food image: ${key}`);
//                 loadedCount++;
//                 if (!foodImages.apple) foodImages.apple = new Image();
//                 foodImages.apple.src = FOOD_IMAGES.apple;
//             };
//             foodImages[key].src = url;
//         }
//     }

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

//     // Handle login
//     async function handleLogin(email, password) {
//         try {
//             const response = await fetch('/login', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
//             });

//             if (response.ok) {
//                 const tokenResponse = await fetch('/get_firebase_token');
//                 const { token } = await tokenResponse.json();

//                 await firebase.auth().signInWithCustomToken(token);
//                 await checkAuthState();
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Login error:', error);
//             return false;
//         }
//     }

//     // Handle signup
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

//     // Handle logout
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
//         document.querySelectorAll('.username-display').forEach(el => {
//             el.textContent = currentUsername;
//         });

//         if (profileBtn) {
//             const usernameSpan = profileBtn.querySelector('.username');
//             if (usernameSpan) {
//                 usernameSpan.textContent = currentUsername;
//             }
//         }

//         if (loginBtn && logoutBtn) {
//             loginBtn.style.display = isAuthenticated ? 'none' : 'block';
//             logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
//         }
//     }

//     // Check auth state
//     async function checkAuthState() {
//         try {
//             const response = await fetch('/check-auth');
//             const data = await response.json();

//             if (data.authenticated) {
//                 currentUserId = data.user.uid;
//                 currentUsername = data.user.display_name;
//                 isAuthenticated = true;

//                 try {
//                     const user = firebase.auth().currentUser;
//                     if (!user) {
//                         const customTokenResponse = await fetch('/get_firebase_token');
//                         const { token } = await customTokenResponse.json();
//                         await firebase.auth().signInWithCustomToken(token);
//                     }
//                 } catch (firebaseError) {
//                     console.error("Firebase sync error:", firebaseError);
//                 }
//             } else {
//                 currentUserId = null;
//                 currentUsername = 'Guest';
//                 isAuthenticated = false;
//             }

//             updateProfileDisplay();
//         } catch (error) {
//             console.error('Error checking auth state:', error);
//             currentUserId = null;
//             currentUsername = 'Guest';
//             isAuthenticated = false;
//             updateProfileDisplay();
//         }
//     }

//     // Render leaderboard entry
//     function renderLeaderboardEntry(entry, mode) {
//         const li = document.createElement('li');
//         li.className = 'leaderboard-entry';
//         li.dataset.userId = entry.userId;

//         if (currentUserId && entry.userId === currentUserId) {
//             li.classList.add('current-user');
//         }

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

//     // Show toast message
//     function showToast(message) {
//         const toast = document.createElement('div');
//         toast.className = 'toast show';
//         toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
//         document.body.appendChild(toast);

//         setTimeout(() => {
//             toast.classList.remove('show');
//             setTimeout(() => toast.remove(), 300);
//         }, 3000);
//     }

//     // Fetch leaderboard
//     async function fetchLeaderboard(mode) {
//         const leaderboardList = document.getElementById('leaderboard-list');
//         if (!leaderboardList) return;

//         try {
//             leaderboardList.innerHTML = '<li class="loading">Loading leaderboard...</li>';

//             const response = await fetch(`/api/leaderboard?mode=${mode}`);

//             if (!response.ok) {
//                 throw new Error(`Server returned ${response.status}`);
//             }

//             const data = await response.json();

//             if (!Array.isArray(data)) {
//                 throw new Error('Invalid leaderboard data');
//             }

//             leaderboardList.innerHTML = '';

//             if (data.length === 0) {
//                 const noScoresItem = document.createElement('li');
//                 noScoresItem.className = 'no-scores';
//                 noScoresItem.textContent = 'No scores yet';
//                 leaderboardList.appendChild(noScoresItem);
//                 return;
//             }

//             data.forEach((entry) => {
//                 const li = renderLeaderboardEntry(entry, mode);
//                 leaderboardList.appendChild(li);
//             });

//             const statusElement = document.getElementById('leaderboard-status');
//             if (statusElement) {
//                 statusElement.textContent = `Showing ${data.length} top players`;
//             }
//         } catch (error) {
//             console.error('Error fetching leaderboard:', error);
//             leaderboardList.innerHTML = `
//                 <li class="error">
//                     Failed to load leaderboard: ${error.message}
//                     <button onclick="window.fetchLeaderboard('${mode}')">Retry</button>
//                 </li>
//             `;
//         }
//     }

//     // Update leaderboard
//     async function updateLeaderboard(score, mode) {
//         try {
//             const user = firebase.auth().currentUser;

//             if (!user) {
//                 console.error("No authenticated user found");
//                 const auth = await fetch('/check-auth');
//                 const authData = await auth.json();
//                 if (authData.authenticated) {
//                     console.log("Session exists but Firebase not synced");
//                     await firebase.auth().signOut();
//                     const token = await user.getIdToken(true);
//                     return updateLeaderboard(score, mode);
//                 }
//                 return false;
//             }

//             const idToken = await user.getIdToken();
//             console.log("Updating score for user:", user.uid, "Score:", score);

//             const userResponse = await fetch('/api/update_user_score', {
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

//             const userData = await userResponse.json();
//             if (!userData.success) {
//                 console.error("Failed to update user score:", userData.message);
//                 return false;
//             }

//             const lbResponse = await fetch('/api/update_leaderboard', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${idToken}`
//                 },
//                 body: JSON.stringify({
//                     mode: mode,
//                     username: currentUsername,
//                     score: score
//                 })
//             });

//             const lbData = await lbResponse.json();
//             if (lbData.status === 'success') {
//                 console.log("Leaderboard updated successfully");
//                 return true;
//             } else {
//                 console.log("Leaderboard not updated:", lbData.message);
//                 return false;
//             }
//         } catch (error) {
//             console.error("Error in updateLeaderboard:", error);
//             return false;
//         }
//     }

//     // Highlight user entry in leaderboard
//     function highlightUserEntry(userId, expiryTime) {
//         const userEntries = document.querySelectorAll(`.leaderboard-entry[data-user-id="${userId}"]`);

//         userEntries.forEach(entry => {
//             entry.classList.add('highlighted');

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

//     // Setup leaderboard buttons
//     function setupLeaderboardButtons() {
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const mode = e.currentTarget.dataset.mode;
//                 switchLeaderboardMode(mode);
//             });
//         });
//     }

//     // Switch leaderboard mode
//     function switchLeaderboardMode(mode) {
//         currentLeaderboardMode = mode;
//         document.querySelectorAll('.leaderboard .mode-btn').forEach(b => {
//             b.classList.toggle('active', b.dataset.mode === mode);
//         });
//         fetchLeaderboard(mode);
//     }

//     // Initialize leaderboard
//     function initializeLeaderboard() {
//         setupLeaderboardButtons();
//         fetchLeaderboard(currentLeaderboardMode);

//         setInterval(() => {
//             fetchLeaderboard(currentLeaderboardMode);
//         }, 30000);
//     }

//     // Update control guide
//     function updateControlGuide(mode) {
//         document.querySelectorAll('.control-guide').forEach(guide => {
//             guide.style.display = 'none';
//         });

//         if (mode === 'keyboard') {
//             document.getElementById('keyboard-guide').style.display = 'block';
//             document.querySelector('.gesture-display').style.display = 'none';
//         } else if (mode === 'gesture') {
//             document.getElementById('gesture-guide').style.display = 'block';
//             document.querySelector('.gesture-display').style.display = 'block';
//         }
//     }

//     // Show selection screen
//     function showSelectionScreen(e) {
//         e.preventDefault();
//         gameContent.classList.add('hidden');
//         selectionScreen.classList.remove('hidden');

//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//             window.isGameRunning = false;
//         }

//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//     }

//     // Keyboard button handler
//     keyboardBtn.addEventListener('click', function () {
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//         updateControlGuide('keyboard');
//         document.body.classList.remove('gesture-mode');

//         localStorage.setItem('hasSelectedMode', 'true');
//         localStorage.setItem('selectedMode', 'keyboard');

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

//     // Gesture button handler
//     gestureBtn.addEventListener('click', function () {
//         if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
//             stopCamera();
//         }
//         updateControlGuide('gesture');
//         document.body.classList.add('gesture-mode');

//         localStorage.setItem('hasSelectedMode', 'true');
//         localStorage.setItem('selectedMode', 'gesture');

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

//     // Game mode button handler
//     if (gameModeBtn) {
//         gameModeBtn.addEventListener('click', function (e) {
//             e.preventDefault();

//             localStorage.removeItem('hasSelectedMode');

//             gameContent.classList.add('hidden');
//             selectionScreen.classList.remove('hidden');

//             if (window.gameInterval) {
//                 clearInterval(window.gameInterval);
//                 window.isGameRunning = false;
//             }

//             if (currentControlMode === 'gesture' && window.stopCamera) {
//                 stopCamera();
//             }
//         });
//     }

//     // Palette icon handler
//     if (paletteIcon) {
//         paletteIcon.addEventListener('click', function (e) {
//             e.preventDefault();
//             gameContent.classList.add('hidden');
//             selectionScreen.classList.remove('hidden');

//             if (window.gameInterval) {
//                 clearInterval(window.gameInterval);
//                 window.isGameRunning = false;
//             }

//             if (currentControlMode === 'gesture' && window.stopCamera) {
//                 stopCamera();
//             }
//         });
//     }

//     // Initialize game
//     function initializeGame() {
//         const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || gameSettings;

//         let gridSize;
//         switch (settings.grid.size) {
//             case 'small': gridSize = 12; break;
//             case 'large': gridSize = 20; break;
//             case 'custom': gridSize = settings.grid.customSize; break;
//             default: gridSize = 15;
//         }

//         const GRID_SIZE = 30;
//         const ROWS = gridSize;
//         const COLS = gridSize;
//         const GAME_SPEED = settings.snake.speed;
//         const GROWTH_RATE = settings.snake.growthRate;
//         const FOOD_TYPE = settings.food.type;
//         const CONTROL_METHOD = settings.controls.method;
//         const KEY_BINDINGS = settings.controls.keyBindings;
//         const MAX_HISTORY_ITEMS = 10;
//         const HISTORY_STORAGE_KEY = 'snakeGameHistory';

//         const GRID_COLOR1 = getComputedStyle(document.documentElement).getPropertyValue('--grid1').trim() || '#e8f5e9';
//         const GRID_COLOR2 = getComputedStyle(document.documentElement).getPropertyValue('--grid2').trim() || '#c8e6c9';
//         const SNAKE_BODY_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
//         const SNAKE_BODY_BORDER = '#000000';
//         const SNAKE_HEAD_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
//         const SNAKE_HEAD_BORDER = '#000000';
//         const SNAKE_TAIL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#66bb6a';
//         const SNAKE_TAIL_BORDER = '#000000';
//         const FOOD_COLOR = settings.foodColor || '#ff0000';

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
//         let score = 0;
//         let highScore = localStorage.getItem('snakeHighScore') || 0;
//         let isPaused = false;
//         let isGameRunning = false;
//         let lastGesture = '';
//         let eventSource = null;
//         let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
//         let lastFrameTime = 0;
//         let accumulatedTime = 0;
//         let lastDirectionChangeTime = 0;
//         let directionChangeCooldown = 50;

//         if (window.gameInterval) {
//             clearInterval(window.gameInterval);
//         }

//         // Optimized game loop
//         function gameLoop(timestamp) {
//             if (!isGameRunning) return;

//             const deltaTime = timestamp - lastFrameTime;
//             lastFrameTime = timestamp;
//             accumulatedTime += deltaTime;

//             if (accumulatedTime >= GAME_SPEED) {
//                 if (!isPaused) {
//                     moveSnake();
//                     checkCollision();
//                 }
//                 drawGame();
//                 accumulatedTime = 0;
//             }

//             requestAnimationFrame(gameLoop);
//         }

//         // Initialize canvas
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

//         // Start game
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

//             lastFrameTime = performance.now();
//             accumulatedTime = 0;
//             requestAnimationFrame(gameLoop);
//         }

//         // Move snake
//         function moveSnake() {
//             if (direction !== nextDirection) {
//                 direction = nextDirection;
//             }

//             for (let i = snake.length - 1; i > 0; i--) {
//                 snake[i].x = snake[i - 1].x;
//                 snake[i].y = snake[i - 1].y;
//             }

//             const head = snake[0];
//             switch (direction) {
//                 case 'up': head.y -= GRID_SIZE; break;
//                 case 'down': head.y += GRID_SIZE; break;
//                 case 'left': head.x -= GRID_SIZE; break;
//                 case 'right': head.x += GRID_SIZE; break;
//             }

//             if (head.x === food.x && head.y === food.y) {
//                 soundManager.playPoint();
//                 for (let i = 0; i < GROWTH_RATE; i++) {
//                     const tail = snake[snake.length - 1];
//                     snake.push({ x: tail.x, y: tail.y });
//                 }

//                 score += 10;
//                 if (scoreDisplay) scoreDisplay.textContent = score;

//                 const isNewHighScore = score > highScore;
//                 if (isNewHighScore) {
//                     highScore = score;
//                     if (highScoreDisplay) highScoreDisplay.textContent = highScore;
//                     localStorage.setItem('snakeHighScore', highScore);
//                 }

//                 generateFood();
//             }
//         }

//         // Check collisions
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

//         // Generate food
//         function generateFood() {
//             let foodX, foodY;
//             let validPosition = false;
//             let attempts = 0;
//             const maxAttempts = 100;

//             while (!validPosition && attempts < maxAttempts) {
//                 attempts++;
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

//             if (validPosition) {
//                 food = { x: foodX, y: foodY };

//                 if (FOOD_TYPE === 'random') {
//                     const foodKeys = Object.keys(FOOD_IMAGES).filter(key => key !== 'random');
//                     const randomKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
//                     currentFoodImg = foodImages[randomKey];
//                 } else {
//                     currentFoodImg = foodImages[FOOD_TYPE] || foodImages.apple;
//                 }
//             } else {
//                 console.warn('Failed to find valid food position after', maxAttempts, 'attempts');

//                 let foundSpot = false;
//                 for (let y = 0; y < ROWS && !foundSpot; y++) {
//                     for (let x = 0; x < COLS && !foundSpot; x++) {
//                         const testX = x * GRID_SIZE;
//                         const testY = y * GRID_SIZE;
//                         let spotValid = true;

//                         for (const segment of snake) {
//                             if (segment.x === testX && segment.y === testY) {
//                                 spotValid = false;
//                                 break;
//                             }
//                         }

//                         if (spotValid) {
//                             foodX = testX;
//                             foodY = testY;
//                             foundSpot = true;
//                         }
//                     }
//                 }

//                 if (foundSpot) {
//                     food = { x: foodX, y: foodY };
//                     currentFoodImg = foodImages[FOOD_TYPE === 'random' ? 'apple' : FOOD_TYPE] || foodImages.apple;
//                 } else {
//                     console.error('Could not find any valid food position');
//                     food = {
//                         x: Math.floor(COLS / 2) * GRID_SIZE,
//                         y: Math.floor(ROWS / 2) * GRID_SIZE
//                     };
//                     currentFoodImg = foodImages.apple;
//                 }
//             }
//         }

//         // Game over
//         function gameOver() {
//             soundManager.playGameOver();
//             cancelAnimationFrame(gameLoop);
//             if (eventSource) eventSource.close();
//             isGameRunning = false;
//             if (gameOverScreen) gameOverScreen.style.display = 'flex';

//             if (score > 0) {
//                 updateHistory(score, currentControlMode);

//                 if (isAuthenticated && score <= highScore) {
//                     updateLeaderboard(score, currentControlMode);
//                 }
//             }
//         }

//         // Update history
//         function updateHistory(newScore, mode) {
//             const historyItem = {
//                 score: newScore,
//                 date: new Date().toISOString(),
//                 mode: mode || 'keyboard'
//             };

//             let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

//             history.unshift(historyItem);

//             localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

//             const updateEvent = new CustomEvent('historyUpdated', {
//                 detail: { history }
//             });
//             window.dispatchEvent(updateEvent);

//             renderHistory();
//         }

//         // Render history
//         function renderHistory() {
//             const tableBody = document.getElementById('history-table-body');
//             if (!tableBody) return;

//             let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
//             const displayHistory = window.location.pathname.includes('history.html') ?
//                 history : history.slice(0, 10);

//             tableBody.innerHTML = '';

//             if (displayHistory.length === 0) {
//                 const row = document.createElement('tr');
//                 row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
//                 tableBody.appendChild(row);
//                 return;
//             }

//             displayHistory.forEach((item, index) => {
//                 const row = document.createElement('tr');
//                 const modeIcon = item.mode === 'gesture' ?
//                     '<i class="fas fa-hand-paper" title="Hand Gesture"></i>' :
//                     '<i class="fas fa-keyboard" title="Keyboard"></i>';

//                 let formattedDate;
//                 try {
//                     const dateObj = new Date(item.date);
//                     formattedDate = dateObj.toLocaleString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit'
//                     });
//                 } catch (e) {
//                     formattedDate = 'Unknown date';
//                 }

//                 row.innerHTML = `
//                     <td>${index + 1}</td>
//                     <td>${item.score}</td>
//                     <td>${formattedDate}</td>
//                     <td>${modeIcon}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         }

//         // Draw game
//         function drawGame() {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             for (let row = 0; row < ROWS; row++) {
//                 for (let col = 0; col < COLS; col++) {
//                     ctx.fillStyle = (row + col) % 2 === 0 ? GRID_COLOR1 : GRID_COLOR2;
//                     ctx.fillRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                     ctx.lineWidth = .2;
//                     ctx.strokeRect(
//                         col * GRID_SIZE,
//                         row * GRID_SIZE,
//                         GRID_SIZE,
//                         GRID_SIZE
//                     );
//                 }
//             }

//             if (foodLoaded && currentFoodImg) {
//                 try {
//                     ctx.drawImage(currentFoodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
//                 } catch (e) {
//                     console.error('Error drawing food:', e);
//                     ctx.fillStyle = '#ff0000';
//                     ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
//                 }
//             }

//             for (let i = 1; i < snake.length - 1; i++) {
//                 const segment = snake[i];
//                 ctx.fillStyle = SNAKE_BODY_COLOR;
//                 ctx.beginPath();
//                 ctx.roundRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE, 5);
//                 ctx.fill();
//                 ctx.strokeStyle = SNAKE_BODY_BORDER;
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

//         // Get segment direction
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

//         // Draw head
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
//             ctx.fillStyle = SNAKE_HEAD_COLOR;
//             ctx.fill();
//             ctx.strokeStyle = SNAKE_HEAD_BORDER;
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

//         // Draw tail
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
//             ctx.fillStyle = SNAKE_TAIL_COLOR;
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
//             ctx.fillStyle = SNAKE_TAIL_COLOR;
//             ctx.fill();

//             ctx.beginPath();
//             ctx.arc(0, 0, GRID_SIZE / 2, 0, Math.PI);
//             ctx.strokeStyle = 'black';
//             ctx.lineWidth = 1;
//             ctx.stroke();

//             ctx.restore();
//         }

//         // Handle gesture input
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

//         // Initialize gesture controls
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

//         // Handle keyboard input
//         function handleKeyDown(e) {
//             if (!isGameRunning || currentControlMode !== 'keyboard') return;

//             const now = performance.now();
//             if (now - lastDirectionChangeTime < directionChangeCooldown) return;

//             if ([KEY_BINDINGS.up, KEY_BINDINGS.down, KEY_BINDINGS.left, KEY_BINDINGS.right].includes(e.key)) {
//                 e.preventDefault();
//             }

//             if (e.key === KEY_BINDINGS.up && direction !== 'down') {
//                 nextDirection = 'up';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.down && direction !== 'up') {
//                 nextDirection = 'down';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.left && direction !== 'right') {
//                 nextDirection = 'left';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.right && direction !== 'left') {
//                 nextDirection = 'right';
//                 lastDirectionChangeTime = now;
//             } else if (e.key === KEY_BINDINGS.pause) {
//                 isPaused = !isPaused;
//             }
//         }

//         // Setup swipe controls for mobile
//         function setupSwipeControls() {
//             const gameBoard = document.querySelector('.game-board');
//             if (!gameBoard) return;

//             let touchStartX = 0;
//             let touchStartY = 0;
//             let touchEndX = 0;
//             let touchEndY = 0;
//             const minSwipeDistance = 30;

//             gameBoard.addEventListener('touchstart', (e) => {
//                 const touch = e.touches[0];
//                 touchStartX = touch.clientX;
//                 touchStartY = touch.clientY;
//             });

//             gameBoard.addEventListener('touchend', (e) => {
//                 if (!isGameRunning || currentControlMode !== 'keyboard') return;

//                 const touch = e.changedTouches[0];
//                 touchEndX = touch.clientX;
//                 touchEndY = touch.clientY;

//                 const deltaX = touchEndX - touchStartX;
//                 const deltaY = touchEndY - touchStartY;
//                 const absDeltaX = Math.abs(deltaX);
//                 const absDeltaY = Math.abs(deltaY);

//                 if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) return;

//                 if (absDeltaX > absDeltaY) {
//                     if (deltaX > 0 && direction !== 'left') {
//                         nextDirection = 'right';
//                     } else if (deltaX < 0 && direction !== 'right') {
//                         nextDirection = 'left';
//                     }
//                 } else {
//                     if (deltaY > 0 && direction !== 'up') {
//                         nextDirection = 'down';
//                     } else if (deltaY < 0 && direction !== 'down') {
//                         nextDirection = 'up';
//                     }
//                 }
//             });

//             let lastTapTime = 0;
//             const doubleTapDelay = 300;

//             gameBoard.addEventListener('touchend', (e) => {
//                 if (!isGameRunning) return;

//                 const currentTime = new Date().getTime();
//                 const tapTimeDiff = currentTime - lastTapTime;

//                 if (tapTimeDiff < doubleTapDelay && tapTimeDiff > 0) {
//                     isPaused = !isPaused;
//                 }

//                 lastTapTime = currentTime;
//             });
//         }

//         // Initialize everything
//         initCanvas();
//         window.addEventListener('resize', initCanvas);

//         if (startBtn) startBtn.addEventListener('click', initGame);
//         if (restartBtn) restartBtn.addEventListener('click', initGame);

//         window.addEventListener('settingsUpdated', (event) => {
//             showToast('New settings applied!');
//             initializeGame();
//         });

//         window.initGestureControls = initGestureControls;
//         document.addEventListener('keydown', handleKeyDown);
//         setupSwipeControls();

//         showStartScreen();
//         renderHistory();
//     }

//     // Make fetchLeaderboard available globally
//     window.fetchLeaderboard = fetchLeaderboard;

//     // Initialize everything
//     initModal();
//     checkAuthState();
//     initializeLeaderboard();
//     preloadFoodImages();
// });










// Play click sound on ALL buttons and links
// document.addEventListener('click', function(e) {
//     // Check if clicked element is a button or link (or inside one)
//     const interactiveElement = e.target.closest('button, a');

//     if (!interactiveElement) return;

//     // Skip these special cases
//     if (interactiveElement.tagName === 'A') {
//         // Don't play sound for empty anchors or javascript links
//         if (interactiveElement.href === '#' || 
//             interactiveElement.href.startsWith('javascript:')) {
//             return;
//         }
//     }

//     // Play the sound
//     soundManager.playClick();

//     // Handle normal link navigation (with slight delay for sound)
//     if (interactiveElement.tagName === 'A' && 
//         !interactiveElement.target === '_blank' &&
//         !interactiveElement.hasAttribute('download')) {
//         e.preventDefault();
//         setTimeout(() => {
//             window.location.href = interactiveElement.href;
//         }, 100);
//     }
// });



















document.addEventListener('DOMContentLoaded', function () {
    // Initialize sound manager with default settings
    const soundManager = new SoundManager();

    // Load settings
    const savedSettings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {};
    const savedSoundSettings = JSON.parse(localStorage.getItem('soundSettings')) || {};

    // Apply sound settings
    soundManager.updateSettings({
        soundEnabled: savedSoundSettings.soundEnabled !== false,
        musicEnabled: savedSoundSettings.musicEnabled !== false,
        sfxEnabled: savedSoundSettings.sfxEnabled !== false,
        masterVolume: savedSoundSettings.masterVolume || 100,
        musicVolume: savedSoundSettings.musicVolume || 50,
        sfxVolume: savedSoundSettings.sfxVolume || 70
    });


    // Click sound for all interactive elements
    document.addEventListener('click', (e) => {
        const target = e.target;
        const shouldPlay = target.closest('button, a, i,select,input,option, .nav-link, .logo-text, .textButton, .logo-icon, .mode-btn');
        if (shouldPlay) {
            soundManager.playClick();
        }
    });
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
    let gameSettings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {
        grid: { size: 'medium', customSize: 15 },
        snake: { speed: 100, growthRate: 1 },
        food: { type: 'apple' },
        controls: {
            method: 'keyboard',
            keyBindings: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                pause: 'Space'
            }
        }
    };


    const FOOD_IMAGES = {
        apple: '/static/img/apple.png',
        banana: '/static/img/banana.png',
        cherry: '/static/img/cherries.png',
        grape: '/static/img/grapes.png',
        orange: '/static/img/orange.png',
        strawberry: '/static/img/strawberry.png',
        watermelon: '/static/img/watermelon.png'
    };

    let foodImages = {};
    let currentFoodImg = null;
    let foodLoaded = false;

    // Check if mode selection has already been made
    const hasSelectedMode = localStorage.getItem('hasSelectedMode');
    const storedMode = localStorage.getItem('selectedMode') || 'keyboard';
    if (storedMode === 'gesture') {
        document.body.classList.add('gesture-mode');
    } else {
        document.body.classList.remove('gesture-mode');
    }

    // If mode is already selected, skip the selection screen
    if (hasSelectedMode) {
        selectionScreen.classList.add('hidden');
        gameContent.classList.remove('hidden');

        currentControlMode = storedMode;
        currentLeaderboardMode = storedMode;

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

        if (!gameInitialized) {
            initializeGame();
            gameInitialized = true;
        }

        switchLeaderboardMode(currentControlMode);
        updateControlGuide(storedMode);
    }

    // Preload food images
    function preloadFoodImages() {
        foodLoaded = false;
        let loadedCount = 0;
        const totalImages = Object.keys(FOOD_IMAGES).length;

        for (const [key, url] of Object.entries(FOOD_IMAGES)) {
            foodImages[key] = new Image();
            foodImages[key].onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    foodLoaded = true;
                    currentFoodImg = foodImages.apple;
                }
            };
            foodImages[key].onerror = () => {
                console.error(`Failed to load food image: ${key}`);
                loadedCount++;
                if (!foodImages.apple) foodImages.apple = new Image();
                foodImages.apple.src = FOOD_IMAGES.apple;
            };
            foodImages[key].src = url;
        }
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

    // Handle login
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
                const tokenResponse = await fetch('/get_firebase_token');
                const { token } = await tokenResponse.json();

                await firebase.auth().signInWithCustomToken(token);
                await checkAuthState();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    // Handle signup
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

    // Handle logout
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
        document.querySelectorAll('.username-display').forEach(el => {
            el.textContent = currentUsername;
        });

        if (profileBtn) {
            const usernameSpan = profileBtn.querySelector('.username');
            if (usernameSpan) {
                usernameSpan.textContent = currentUsername;
            }
        }

        if (loginBtn && logoutBtn) {
            loginBtn.style.display = isAuthenticated ? 'none' : 'block';
            logoutBtn.style.display = isAuthenticated ? 'block' : 'none';
        }
    }

    // Check auth state
    async function checkAuthState() {
        try {
            const response = await fetch('/check-auth');
            const data = await response.json();

            if (data.authenticated) {
                currentUserId = data.user.uid;
                currentUsername = data.user.display_name;
                isAuthenticated = true;

                try {
                    const user = firebase.auth().currentUser;
                    if (!user) {
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

    // Render leaderboard entry
    function renderLeaderboardEntry(entry, mode) {
        const li = document.createElement('li');
        li.className = 'leaderboard-entry';
        li.dataset.userId = entry.userId;

        if (currentUserId && entry.userId === currentUserId) {
            li.classList.add('current-user');
        }

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

    // Show toast message
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Fetch leaderboard
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

    // Update leaderboard
    async function updateLeaderboard(score, mode) {
        try {
            const user = firebase.auth().currentUser;

            if (!user) {
                console.error("No authenticated user found");
                const auth = await fetch('/check-auth');
                const authData = await auth.json();
                if (authData.authenticated) {
                    console.log("Session exists but Firebase not synced");
                    await firebase.auth().signOut();
                    const token = await user.getIdToken(true);
                    return updateLeaderboard(score, mode);
                }
                return false;
            }

            const idToken = await user.getIdToken();
            console.log("Updating score for user:", user.uid, "Score:", score);

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

    // Highlight user entry in leaderboard
    function highlightUserEntry(userId, expiryTime) {
        const userEntries = document.querySelectorAll(`.leaderboard-entry[data-user-id="${userId}"]`);

        userEntries.forEach(entry => {
            entry.classList.add('highlighted');

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

    // Setup leaderboard buttons
    function setupLeaderboardButtons() {
        document.querySelectorAll('.leaderboard .mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = e.currentTarget.dataset.mode;
                switchLeaderboardMode(mode);
            });
        });
    }

    // Switch leaderboard mode
    function switchLeaderboardMode(mode) {
        currentLeaderboardMode = mode;
        document.querySelectorAll('.leaderboard .mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === mode);
        });
        fetchLeaderboard(mode);
    }

    // Initialize leaderboard
    function initializeLeaderboard() {
        setupLeaderboardButtons();
        fetchLeaderboard(currentLeaderboardMode);

        setInterval(() => {
            fetchLeaderboard(currentLeaderboardMode);
        }, 30000);
    }

    // Update control guide
    function updateControlGuide(mode) {
        document.querySelectorAll('.control-guide').forEach(guide => {
            guide.style.display = 'none';
        });

        if (mode === 'keyboard') {
            document.getElementById('keyboard-guide').style.display = 'block';
            document.querySelector('.gesture-display').style.display = 'none';
        } else if (mode === 'gesture') {
            document.getElementById('gesture-guide').style.display = 'block';
            document.querySelector('.gesture-display').style.display = 'block';
        }
    }

    // Show selection screen
    function showSelectionScreen(e) {
        e.preventDefault();
        gameContent.classList.add('hidden');
        selectionScreen.classList.remove('hidden');

        if (window.gameInterval) {
            clearInterval(window.gameInterval);
            window.isGameRunning = false;
        }

        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
    }

    // Keyboard button handler
    keyboardBtn.addEventListener('click', function () {
        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
        updateControlGuide('keyboard');
        document.body.classList.remove('gesture-mode');

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

    // Gesture button handler
    gestureBtn.addEventListener('click', function () {
        if (currentControlMode === 'gesture' && typeof stopCamera === 'function') {
            stopCamera();
        }
        updateControlGuide('gesture');
        document.body.classList.add('gesture-mode');

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

    // Game mode button handler
    if (gameModeBtn) {
        gameModeBtn.addEventListener('click', function (e) {
            e.preventDefault();

            localStorage.removeItem('hasSelectedMode');

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

    // Palette icon handler
    if (paletteIcon) {
        paletteIcon.addEventListener('click', function (e) {
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
        const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {
            grid: { size: 'medium', customSize: 15 },
            snake: { speed: 100, growthRate: 1 },
            food: { type: 'apple' },
            controls: {
                method: 'keyboard',
                keyBindings: {
                    up: 'ArrowUp',
                    down: 'ArrowDown',
                    left: 'ArrowLeft',
                    right: 'ArrowRight',
                    pause: 'Space'
                }
            }
        };

        // Validate and clamp speed value
        let speed = settings.snake.speed;
        speed = Math.max(40, Math.min(300, speed || 100));
        settings.snake.speed = speed;

        let gridSize;
        switch (settings.grid.size) {
            case 'small': gridSize = 12; break;
            case 'large': gridSize = 20; break;
            case 'custom': gridSize = settings.grid.customSize; break;
            default: gridSize = 15;
        }

        const GRID_SIZE = 30;
        const ROWS = gridSize;
        const COLS = gridSize;
        const GAME_SPEED = settings.snake.speed;
        const GROWTH_RATE = settings.snake.growthRate;
        const FOOD_TYPE = settings.food.type;
        const CONTROL_METHOD = settings.controls.method;
        const KEY_BINDINGS = settings.controls.keyBindings;
        const MAX_HISTORY_ITEMS = 10;
        const HISTORY_STORAGE_KEY = 'snakeGameHistory';

        const GRID_COLOR1 = getComputedStyle(document.documentElement).getPropertyValue('--grid1').trim() || '#e8f5e9';
        const GRID_COLOR2 = getComputedStyle(document.documentElement).getPropertyValue('--grid2').trim() || '#c8e6c9';
        const SNAKE_BODY_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
        const SNAKE_BODY_BORDER = '#000000';
        const SNAKE_HEAD_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#4CAF50';
        const SNAKE_HEAD_BORDER = '#000000';
        const SNAKE_TAIL_COLOR = getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim() || '#66bb6a';
        const SNAKE_TAIL_BORDER = '#000000';
        const FOOD_COLOR = settings.foodColor || '#ff0000';

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
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let isPaused = false;
        let isGameRunning = false;
        let lastGesture = '';
        let isPausedByGesture = false;
        let lastNonStopGesture = '';
        let eventSource = null;
        let scoreHistory = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
        let lastFrameTime = 0;
        let accumulatedTime = 0;
        let lastDirectionChangeTime = 0;
        let directionChangeCooldown = 50;
        if (window.gameInterval) {
            clearInterval(window.gameInterval);
        }


        // Optimized game loop
        // function gameLoop(timestamp) {
        //     if (!isGameRunning) return;

        //     const deltaTime = timestamp - lastFrameTime;
        //     lastFrameTime = timestamp;
        //     accumulatedTime += deltaTime;

        //     if (accumulatedTime >= GAME_SPEED) {
        //         if (!isPaused) {
        //             moveSnake();
        //             checkCollision();
        //         }
        //         drawGame();
        //         accumulatedTime = 0;
        //     }

        //     requestAnimationFrame(gameLoop);
        // }

        //         function gameLoop(timestamp) {
        //     if (!isGameRunning) return;

        //     const deltaTime = timestamp - lastFrameTime;
        //     lastFrameTime = timestamp;
        //     accumulatedTime += deltaTime;

        //     if (accumulatedTime >= GAME_SPEED) {
        //         if (!isPaused) {
        //             moveSnake();
        //             checkCollision();
        //         }
        //         drawGame();
        //         accumulatedTime = 0;

        //         // Update the gesture display to show pause state
        //         if (gestureDisplay) {
        //             if (isPausedByGesture) {
        //                 gestureDisplay.textContent = "Paused (Stop Gesture)";
        //             } else {
        //                 gestureDisplay.textContent = lastGesture;
        //             }
        //         }
        //     }

        //     requestAnimationFrame(gameLoop);
        // }

        function gameLoop(timestamp) {
            if (!isGameRunning) return;

            const deltaTime = timestamp - lastFrameTime;
            lastFrameTime = timestamp;
            accumulatedTime += deltaTime;

            if (accumulatedTime >= GAME_SPEED) {
                if (!isPaused && !isPausedByGesture) {
                    moveSnake();
                    checkCollision();
                }
                drawGame();
                accumulatedTime = 0;

                // Update the gesture display to show pause state
                if (gestureDisplay) {
                    if (isPausedByGesture) {
                        gestureDisplay.textContent = "Paused (Stop Gesture)";
                    } else if (isPaused && currentControlMode === 'keyboard') {
                        gestureDisplay.textContent = "Paused (Space)";
                    } else {
                        gestureDisplay.textContent = lastGesture || "None";
                    }
                }
            }

            requestAnimationFrame(gameLoop);
        }

        // Initialize canvas
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

        // Start game
        function initGame() {
            if (gameStartScreen) gameStartScreen.style.display = 'none';
            if (gameOverScreen) gameOverScreen.style.display = 'none';
            isGameRunning = true;
            isPausedByGesture = false;
            isPaused = false;

            soundManager.playBackgroundMusic();

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

            lastFrameTime = performance.now();
            accumulatedTime = 0;
            requestAnimationFrame(gameLoop);
        }

        // Move snake
        function moveSnake() {
            if (direction !== nextDirection) {
                direction = nextDirection;
            }

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
                soundManager.playPoint();
                for (let i = 0; i < GROWTH_RATE; i++) {
                    const tail = snake[snake.length - 1];
                    snake.push({ x: tail.x, y: tail.y });
                }

                score += 10;
                if (scoreDisplay) scoreDisplay.textContent = score;

                const isNewHighScore = score > highScore;
                if (isNewHighScore) {
                    highScore = score;
                    if (highScoreDisplay) highScoreDisplay.textContent = highScore;
                    localStorage.setItem('snakeHighScore', highScore);
                }

                generateFood();
            }
        }

        // Check collisions
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

        // Generate food
        function generateFood() {
            let foodX, foodY;
            let validPosition = false;
            let attempts = 0;
            const maxAttempts = 100;

            while (!validPosition && attempts < maxAttempts) {
                attempts++;
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

            if (validPosition) {
                food = { x: foodX, y: foodY };

                if (FOOD_TYPE === 'random') {
                    const foodKeys = Object.keys(FOOD_IMAGES).filter(key => key !== 'random');
                    const randomKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
                    currentFoodImg = foodImages[randomKey];
                } else {
                    currentFoodImg = foodImages[FOOD_TYPE] || foodImages.apple;
                }
            } else {
                console.warn('Failed to find valid food position after', maxAttempts, 'attempts');

                let foundSpot = false;
                for (let y = 0; y < ROWS && !foundSpot; y++) {
                    for (let x = 0; x < COLS && !foundSpot; x++) {
                        const testX = x * GRID_SIZE;
                        const testY = y * GRID_SIZE;
                        let spotValid = true;

                        for (const segment of snake) {
                            if (segment.x === testX && segment.y === testY) {
                                spotValid = false;
                                break;
                            }
                        }

                        if (spotValid) {
                            foodX = testX;
                            foodY = testY;
                            foundSpot = true;
                        }
                    }
                }

                if (foundSpot) {
                    food = { x: foodX, y: foodY };
                    currentFoodImg = foodImages[FOOD_TYPE === 'random' ? 'apple' : FOOD_TYPE] || foodImages.apple;
                } else {
                    console.error('Could not find any valid food position');
                    food = {
                        x: Math.floor(COLS / 2) * GRID_SIZE,
                        y: Math.floor(ROWS / 2) * GRID_SIZE
                    };
                    currentFoodImg = foodImages.apple;
                }
            }
        }

        // Game over
        function gameOver() {
            soundManager.playGameOver();
            soundManager.stopBackgroundMusic();
            cancelAnimationFrame(gameLoop);
            if (eventSource) eventSource.close();
            isGameRunning = false;
            if (gameOverScreen) gameOverScreen.style.display = 'flex';

            if (score > 0) {
                updateHistory(score, currentControlMode);

                if (isAuthenticated && score <= highScore) {
                    updateLeaderboard(score, currentControlMode);
                }
            }
        }

        // Update history
        function updateHistory(newScore, mode) {
            const historyItem = {
                score: newScore,
                date: new Date().toISOString(),
                mode: mode || 'keyboard'
            };

            let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];

            history.unshift(historyItem);

            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

            const updateEvent = new CustomEvent('historyUpdated', {
                detail: { history }
            });
            window.dispatchEvent(updateEvent);

            renderHistory();
        }

        // Render history
        function renderHistory() {
            const tableBody = document.getElementById('history-table-body');
            if (!tableBody) return;

            let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY)) || [];
            const displayHistory = window.location.pathname.includes('history.html') ?
                history : history.slice(0, 10);

            tableBody.innerHTML = '';

            if (displayHistory.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" class="no-history">No history yet</td>`;
                tableBody.appendChild(row);
                return;
            }

            displayHistory.forEach((item, index) => {
                const row = document.createElement('tr');
                const modeIcon = item.mode === 'gesture' ?
                    '<i class="fas fa-hand-paper" title="Hand Gesture"></i>' :
                    '<i class="fas fa-keyboard" title="Keyboard"></i>';

                let formattedDate;
                try {
                    const dateObj = new Date(item.date);
                    formattedDate = dateObj.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } catch (e) {
                    formattedDate = 'Unknown date';
                }

                row.innerHTML = `
<td>${index + 1}</td>
<td>${item.score}</td>
<td>${formattedDate}</td>
<td>${modeIcon}</td>
`;
                tableBody.appendChild(row);
            });
        }

        // Draw game
        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    ctx.fillStyle = (row + col) % 2 === 0 ? GRID_COLOR1 : GRID_COLOR2;
                    ctx.fillRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                    ctx.lineWidth = .2;
                    ctx.strokeRect(
                        col * GRID_SIZE,
                        row * GRID_SIZE,
                        GRID_SIZE,
                        GRID_SIZE
                    );
                }
            }

            // Draw food
            if (foodLoaded && currentFoodImg) {
                try {
                    ctx.drawImage(currentFoodImg, food.x, food.y, GRID_SIZE, GRID_SIZE);
                } catch (e) {
                    console.error('Error drawing food:', e);
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
                }
            }

            // Draw snake body
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

            // Draw tail
            if (snake.length > 1) {
                const tail = snake[snake.length - 1];
                const tailDir = getSegmentDirection(snake.length - 1);
                drawTail(tail.x, tail.y, tailDir);
            }

            // Draw head
            if (snake.length > 0) {
                const head = snake[0];
                drawHead(head.x, head.y, direction);
            }

            // Show pause overlay
            if (isPaused || isPausedByGesture) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = 'white';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';

                if (isPausedByGesture) {
                    ctx.fillText('PAUSED (Stop Gesture)', canvas.width / 2, canvas.height / 2);
                } else if (isPaused && currentControlMode === 'keyboard') {
                    ctx.fillText('PAUSED (Space to Resume)', canvas.width / 2, canvas.height / 2);
                }
            }
        }

        // Get segment direction
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

        // Draw head
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

        // Draw tail
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

        // Handle gesture input
        // function handleGesture(gesture) {
        //     if (!isGameRunning || currentControlMode !== 'gesture') return;

        //     const validDirections = ['up', 'down', 'left', 'right'];
        //     if (!validDirections.includes(gesture)) return;

        //     if ((direction === 'up' && gesture === 'down') ||
        //         (direction === 'down' && gesture === 'up') ||
        //         (direction === 'left' && gesture === 'right') ||
        //         (direction === 'right' && gesture === 'left')) {
        //         return;
        //     }

        //     nextDirection = gesture;
        // }


        function handleGesture(gesture) {
            if (!isGameRunning || currentControlMode !== 'gesture') return;

            const validDirections = ['up', 'down', 'left', 'right', 'stop'];
            if (!validDirections.includes(gesture)) return;

            if (gesture === 'stop') {
                // Toggle pause state when stop gesture is detected
                isPausedByGesture = true;
                isPaused = true;
                return;
            } else if (isPausedByGesture) {
                // If game was paused by gesture, resume when any other gesture is detected
                isPausedByGesture = false;
                isPaused = false;
                lastNonStopGesture = gesture;
            }

            // Only change direction if not paused
            if (!isPaused) {
                if ((direction === 'up' && gesture === 'down') ||
                    (direction === 'down' && gesture === 'up') ||
                    (direction === 'left' && gesture === 'right') ||
                    (direction === 'right' && gesture === 'left')) {
                    return;
                }

                nextDirection = gesture;
                lastNonStopGesture = gesture;
            }
        }

        // Initialize gesture controls
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

        // Handle keyboard input
        // function handleKeyDown(e) {
        //     if (!isGameRunning || currentControlMode !== 'keyboard') return;

        //     const now = performance.now();
        //     if (now - lastDirectionChangeTime < directionChangeCooldown) return;

        //     if ([KEY_BINDINGS.up, KEY_BINDINGS.down, KEY_BINDINGS.left, KEY_BINDINGS.right].includes(e.key)) {
        //         e.preventDefault();
        //     }

        //     if (e.key === KEY_BINDINGS.up && direction !== 'down') {
        //         nextDirection = 'up';
        //         lastDirectionChangeTime = now;
        //     } else if (e.key === KEY_BINDINGS.down && direction !== 'up') {
        //         nextDirection = 'down';
        //         lastDirectionChangeTime = now;
        //     } else if (e.key === KEY_BINDINGS.left && direction !== 'right') {
        //         nextDirection = 'left';
        //         lastDirectionChangeTime = now;
        //     } else if (e.key === KEY_BINDINGS.right && direction !== 'left') {
        //         nextDirection = 'right';
        //         lastDirectionChangeTime = now;
        //     } else if (e.key === KEY_BINDINGS.pause) {
        //         isPaused = !isPaused;
        //     }
        // }


        function handleKeyDown(e) {
            if (!isGameRunning || currentControlMode !== 'keyboard') return;

            const now = performance.now();

            // Handle pause key separately from direction changes
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                isPaused = !isPaused;
                isPausedByGesture = false; // Make sure gesture pause is cleared
                console.log('Pause toggled:', isPaused); // Debug log
                return;
            }

            // Only apply direction change cooldown to movement keys
            if (now - lastDirectionChangeTime < directionChangeCooldown) return;

            // Prevent default for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            // Handle direction changes
            if ((e.key === 'ArrowUp' || e.key === KEY_BINDINGS.up) && direction !== 'down') {
                nextDirection = 'up';
                lastDirectionChangeTime = now;
            } else if ((e.key === 'ArrowDown' || e.key === KEY_BINDINGS.down) && direction !== 'up') {
                nextDirection = 'down';
                lastDirectionChangeTime = now;
            } else if ((e.key === 'ArrowLeft' || e.key === KEY_BINDINGS.left) && direction !== 'right') {
                nextDirection = 'left';
                lastDirectionChangeTime = now;
            } else if ((e.key === 'ArrowRight' || e.key === KEY_BINDINGS.right) && direction !== 'left') {
                nextDirection = 'right';
                lastDirectionChangeTime = now;
            }
        }

        // Setup swipe controls for mobile
        function setupSwipeControls() {
            const gameBoard = document.querySelector('.game-board');
            if (!gameBoard) return;

            let touchStartX = 0;
            let touchStartY = 0;
            let touchEndX = 0;
            let touchEndY = 0;
            const minSwipeDistance = 30;

            gameBoard.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            });

            gameBoard.addEventListener('touchend', (e) => {
                if (!isGameRunning || currentControlMode !== 'keyboard') return;

                const touch = e.changedTouches[0];
                touchEndX = touch.clientX;
                touchEndY = touch.clientY;

                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const absDeltaX = Math.abs(deltaX);
                const absDeltaY = Math.abs(deltaY);

                if (Math.max(absDeltaX, absDeltaY) < minSwipeDistance) return;

                if (absDeltaX > absDeltaY) {
                    if (deltaX > 0 && direction !== 'left') {
                        nextDirection = 'right';
                    } else if (deltaX < 0 && direction !== 'right') {
                        nextDirection = 'left';
                    }
                } else {
                    if (deltaY > 0 && direction !== 'up') {
                        nextDirection = 'down';
                    } else if (deltaY < 0 && direction !== 'down') {
                        nextDirection = 'up';
                    }
                }
            });

            let lastTapTime = 0;
            const doubleTapDelay = 300;

            gameBoard.addEventListener('touchend', (e) => {
                if (!isGameRunning) return;

                const currentTime = new Date().getTime();
                const tapTimeDiff = currentTime - lastTapTime;

                if (tapTimeDiff < doubleTapDelay && tapTimeDiff > 0) {
                    isPaused = !isPaused;
                }

                lastTapTime = currentTime;
            });
        }

        // Initialize everything
        initCanvas();
        window.addEventListener('resize', initCanvas);

        if (startBtn) startBtn.addEventListener('click', initGame);
        if (restartBtn) restartBtn.addEventListener('click', initGame);

        window.addEventListener('settingsUpdated', (event) => {
            showToast('New settings applied!');
            initializeGame();
        });

        window.initGestureControls = initGestureControls;
        document.addEventListener('keydown', handleKeyDown);
        setupSwipeControls();

        showStartScreen();
        renderHistory();
    }

    // Make fetchLeaderboard available globally
    window.fetchLeaderboard = fetchLeaderboard;

    // Initialize everything
    initModal();
    checkAuthState();
    initializeLeaderboard();
    preloadFoodImages();
});
