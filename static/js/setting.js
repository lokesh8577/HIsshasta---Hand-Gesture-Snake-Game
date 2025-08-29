document.addEventListener('DOMContentLoaded', function () {


    // DOM elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    const gridSizeSelect = document.getElementById('grid-size');
    const customSizeGroup = document.getElementById('custom-size-group');
    const customSizeSlider = document.getElementById('custom-size-value');
    const sizeTooltip = document.getElementById('size-tooltip');
    const snakeSpeedSlider = document.getElementById('snake-speed');
    const speedTooltip = document.getElementById('speed-tooltip');
    const foodOptions = document.querySelectorAll('input[name="food-type"]');
    const growthRateOptions = document.querySelectorAll('input[name="growth-rate"]');
    const keyBindings = document.querySelectorAll('.key-input');
    const resetBtn = document.getElementById('reset-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const settingsForm = document.getElementById('settings-form');
    const toastContainer = document.getElementById('toast-container');

    // Default settings
    const DEFAULT_SETTINGS = {
        grid: {
            size: 'medium',
            customSize: 15
        },
        snake: {
            speed: 100,
            growthRate: 1
        },
        food: {
            type: 'apple'
        },
        controls: {
            method: 'keyboard',
            keyBindings: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                pause: 'Space'
            }
        },
        sound: {
            soundEnabled: true,
            musicEnabled: true,
            sfxEnabled: true,
            masterVolume: 100,
            musicVolume: 50,
            sfxVolume: 70
        }
    };

    // Current settings
    let currentSettings = { ...DEFAULT_SETTINGS };
    let isEditingKey = false;
    let currentKeyAction = null;

    // Initialize tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = tab.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Initialize range sliders
    function updateSizeTooltip() {
        const size = customSizeSlider.value;
        sizeTooltip.textContent = `${size}×${size}`;
        currentSettings.grid.customSize = parseInt(size);
    }

    function updateSpeedTooltip() {
        const speed = parseInt(snakeSpeedSlider.value);
        let description;

        if (speed <= 60) description = `Extreme (${speed}ms)`;
        else if (speed <= 80) description = `Fast (${speed}ms)`;
        else if (speed <= 100) description = `Medium (${speed}ms)`;
        else if (speed <= 150) description = `Slow (${speed}ms)`;
        else description = `Very Slow (${speed}ms)`;

        speedTooltip.textContent = description;
        currentSettings.snake.speed = speed;
    }

    customSizeSlider.addEventListener('input', updateSizeTooltip);
    snakeSpeedSlider.addEventListener('input', updateSpeedTooltip);

    // Grid size selection
    gridSizeSelect.addEventListener('change', function () {
        currentSettings.grid.size = this.value;
        customSizeGroup.classList.toggle('hidden', this.value !== 'custom');

        if (this.value !== 'custom') {
            const sizeMap = {
                small: 12,
                medium: 15,
                large: 20
            };
            customSizeSlider.value = sizeMap[this.value];
            updateSizeTooltip();
        }
    });

    // Food type selection
    foodOptions.forEach(option => {
        option.addEventListener('change', function () {
            if (this.checked) {
                currentSettings.food.type = this.value;
            }
        });
    });

    // Growth rate selection
    growthRateOptions.forEach(option => {
        option.addEventListener('change', function () {
            if (this.checked) {
                currentSettings.snake.growthRate = parseInt(this.value);
            }
        });
    });

    // Key binding editor
    keyBindings.forEach(binding => {
        binding.addEventListener('click', function () {
            if (isEditingKey) return;

            isEditingKey = true;
            currentKeyAction = this.getAttribute('data-action');
            this.textContent = 'Press any key...';
            this.classList.add('editing');
        });
    });

    document.addEventListener('keydown', function (e) {
        if (!isEditingKey) return;

        e.preventDefault();
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;

        currentSettings.controls.keyBindings[currentKeyAction] = key;

        const keyElement = document.querySelector(`.key-input[data-action="${currentKeyAction}"]`);
        if (keyElement) {
            keyElement.textContent = key;
            keyElement.classList.remove('editing');
        }

        isEditingKey = false;
        currentKeyAction = null;
    });

    // Sound toggle functionality
    function setupSoundToggles() {
        // Master Sound Toggle
        document.getElementById('sound-enabled')?.addEventListener('change', function () {
            currentSettings.sound.soundEnabled = this.checked;

            if (!this.checked) {
                // Disable all sounds if master is off
                document.getElementById('music-enabled').checked = false;
                document.getElementById('sfx-enabled').checked = false;
                currentSettings.sound.musicEnabled = false;
                currentSettings.sound.sfxEnabled = false;
            }

            updateSoundManager();
        });

        // Music Toggle
        document.getElementById('music-enabled')?.addEventListener('change', function () {
            currentSettings.sound.musicEnabled = this.checked;

            if (this.checked) {
                // Ensure master sound is enabled
                document.getElementById('sound-enabled').checked = true;
                currentSettings.sound.soundEnabled = true;
            }

            updateSoundManager();
        });

        // SFX Toggle
        document.getElementById('sfx-enabled')?.addEventListener('change', function () {
            currentSettings.sound.sfxEnabled = this.checked;

            if (this.checked) {
                // Ensure master sound is enabled
                document.getElementById('sound-enabled').checked = true;
                currentSettings.sound.soundEnabled = true;
            }

            updateSoundManager();
        });

        // Volume controls
        document.getElementById('master-volume')?.addEventListener('input', function () {
            currentSettings.sound.masterVolume = parseInt(this.value);
            document.getElementById('master-tooltip').textContent = `${this.value}%`;
            updateSoundManager();
        });

        document.getElementById('music-volume')?.addEventListener('input', function () {
            currentSettings.sound.musicVolume = parseInt(this.value);
            document.getElementById('music-tooltip').textContent = `${this.value}%`;
            updateSoundManager();
        });

        document.getElementById('sfx-volume')?.addEventListener('input', function () {
            currentSettings.sound.sfxVolume = parseInt(this.value);
            document.getElementById('sfx-tooltip').textContent = `${this.value}%`;
            updateSoundManager();
        });
    }

    function updateSoundManager() {
        if (window.soundManager) {
            soundManager.updateSettings(currentSettings.sound);

            // Handle music state change
            if (currentSettings.sound.musicEnabled !== soundManager.settings.musicEnabled) {
                if (currentSettings.sound.musicEnabled) {
                    soundManager.playBackgroundMusic();
                } else {
                    soundManager.stopBackgroundMusic();
                }
            }
        }
    }

    // Test sound buttons
    function setupTestButtons() {
        document.getElementById('test-click')?.addEventListener('click', () => {
            if (window.soundManager && currentSettings.sound.soundEnabled && currentSettings.sound.sfxEnabled) {
                soundManager.playClick();
            }
        });

        document.getElementById('test-point')?.addEventListener('click', () => {
            if (window.soundManager && currentSettings.sound.soundEnabled && currentSettings.sound.sfxEnabled) {
                soundManager.playPoint();
            }
        });

        document.getElementById('test-gameover')?.addEventListener('click', () => {
            if (window.soundManager && currentSettings.sound.soundEnabled && currentSettings.sound.sfxEnabled) {
                soundManager.playGameOver();
            }
        });
    }




    resetBtn.addEventListener('click', function () {
        showConfirmationPopup(
            'Reset Settings',
            'Are you sure you want to reset all settings to defaults?',
            () => {
                currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                updateUI();
                localStorage.setItem('snakeGameSettings', JSON.stringify(currentSettings));
                showToast('Settings reset to defaults', 'success');
                const event = new CustomEvent('settingsUpdated', { detail: currentSettings });
                window.dispatchEvent(event);
            }
        );
    });


    // Handle form submission (Apply button)
    settingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        applySettings(); // This already shows a toast inside it
    });
    // Cancel changes
    cancelBtn.addEventListener('click', function () {
        showConfirmationPopup(
            'Discard Changes',
            'Discard all changes and return to game?',
            () => {
                window.location.href = '/';
            }
        );
    });

    // Load settings from localStorage or defaults
    function loadSettings() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('snakeGameSettings'));
            const savedSoundSettings = JSON.parse(localStorage.getItem('soundSettings'));

            if (savedSettings) {
                currentSettings = {
                    ...DEFAULT_SETTINGS,
                    ...savedSettings,
                    sound: {
                        ...DEFAULT_SETTINGS.sound,
                        ...(savedSoundSettings || {}),
                        ...(savedSettings.sound || {})
                    }
                };
            } else {
                currentSettings = { ...DEFAULT_SETTINGS };
            }

            updateUI();
        } catch (error) {
            console.error('Error loading settings:', error);
            currentSettings = { ...DEFAULT_SETTINGS };
            updateUI();
            showToast('Error loading settings. Using defaults.', 'error');
        }
    }

    // Update UI elements with current settings
    function updateUI() {
        try {
            // Grid settings
            gridSizeSelect.value = currentSettings.grid.size;
            customSizeSlider.value = currentSettings.grid.customSize;
            updateSizeTooltip();
            customSizeGroup.classList.toggle('hidden', currentSettings.grid.size !== 'custom');

            // Snake settings
            snakeSpeedSlider.value = currentSettings.snake.speed;
            updateSpeedTooltip();

            // Growth rate
            document.querySelector(`input[name="growth-rate"][value="${currentSettings.snake.growthRate}"]`).checked = true;

            // Food type
            document.querySelector(`input[name="food-type"][value="${currentSettings.food.type}"]`).checked = true;

            // Sound settings
            document.getElementById('sound-enabled').checked = currentSettings.sound.soundEnabled;
            document.getElementById('music-enabled').checked = currentSettings.sound.musicEnabled;
            document.getElementById('sfx-enabled').checked = currentSettings.sound.sfxEnabled;
            document.getElementById('master-volume').value = currentSettings.sound.masterVolume;
            document.getElementById('master-tooltip').textContent = `${currentSettings.sound.masterVolume}%`;
            document.getElementById('music-volume').value = currentSettings.sound.musicVolume;
            document.getElementById('music-tooltip').textContent = `${currentSettings.sound.musicVolume}%`;
            document.getElementById('sfx-volume').value = currentSettings.sound.sfxVolume;
            document.getElementById('sfx-tooltip').textContent = `${currentSettings.sound.sfxVolume}%`;

            // Key bindings
            Object.entries(currentSettings.controls.keyBindings).forEach(([action, key]) => {
                const keyElement = document.querySelector(`.key-input[data-action="${action}"]`);
                if (keyElement) keyElement.textContent = key;
            });

            // Setup event listeners
            setupSoundToggles();
            setupTestButtons();

        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }
    // Show toast message
    // function showToast(message) {
    //     const toast = document.createElement('div');
    //     toast.className = 'toast show';
    //     toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    //     document.body.appendChild(toast);

    //     setTimeout(() => {
    //         toast.classList.remove('show');
    //         setTimeout(() => toast.remove(), 300);
    //     }, 3000);
    // }
    function showToast(message, type = 'info') {
        console.log("Attempting to show toast:", message); // Debug log

        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.error("Toast container doesn't exist!");
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} show`;
        toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                    'fa-info-circle'}"></i>
        <span>${message}</span>
        <div class="toast-progress"></div>
    `;

        console.log("Toast HTML:", toast.innerHTML); // Debug log

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                console.log("Removing toast"); // Debug log
                toast.remove();
            }, 300);
        }, 3000);
    }
    // Save settings to localStorage
    function applySettings() {
        try {
            localStorage.setItem('snakeGameSettings', JSON.stringify(currentSettings));
            localStorage.setItem('soundSettings', JSON.stringify(currentSettings.sound));

            if (window.soundManager) {
                soundManager.updateSettings(currentSettings.sound);
                if (!currentSettings.sound.musicEnabled) {
                    soundManager.stopBackgroundMusic();
                }
            }

            showToast('Settings saved successfully!', 'success');
            const event = new CustomEvent('settingsUpdated', { detail: currentSettings });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Failed to save settings', 'error');
        }
    }

    // Show confirmation popup
    function showConfirmationPopup(title, message, confirmCallback) {
        const popup = document.createElement('div');
        popup.className = 'confirmation-popup';

        popup.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${title}</h3>
                </div>
                <div class="popup-body">
                    <p>${message}</p>
                </div>
                <div class="popup-actions">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-primary confirm-btn">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        popup.querySelector('.confirm-btn').addEventListener('click', () => {
            confirmCallback();
            document.body.removeChild(popup);
        });

        popup.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(popup);
        });
    }

    // Initialize
    loadSettings();
});