document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const gridSizeSelect = document.getElementById('grid-size');
    const customSizeGroup = document.getElementById('custom-size-group');
    const customRowsInput = document.getElementById('custom-rows');
    const customColsInput = document.getElementById('custom-cols');
    const foodTypeSelect = document.getElementById('food-type');
    const foodColorGroup = document.getElementById('food-color-group');
    const applyBtn = document.getElementById('apply-btn');
    const resetBtn = document.getElementById('reset-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const settingsForm = document.getElementById('settings-form');
    
    // Toast and Modal elements
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span></span>';
    document.body.appendChild(toast);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Warning</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p id="modal-message"></p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" id="modal-confirm">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners
    gridSizeSelect.addEventListener('change', toggleCustomSize);
    foodTypeSelect.addEventListener('change', toggleFoodColor);
    applyBtn.addEventListener('click', applySettings);
    resetBtn.addEventListener('click', resetSettings);
    cancelBtn.addEventListener('click', cancelChanges);
    settingsForm.addEventListener('submit', (e) => e.preventDefault());
    document.getElementById('modal-confirm').addEventListener('click', () => modal.classList.remove('show'));
    document.querySelector('.close-btn').addEventListener('click', () => modal.classList.remove('show'));
    
    // Initialize form with saved settings or defaults
    loadSettings();
    
    // Toggle custom size inputs
    function toggleCustomSize() {
        if (gridSizeSelect.value === 'custom') {
            customSizeGroup.classList.remove('hidden');
        } else {
            customSizeGroup.classList.add('hidden');
        }
    }
    
    // Toggle food color input
    function toggleFoodColor() {
        if (foodTypeSelect.value === 'color') {
            foodColorGroup.classList.remove('hidden');
        } else {
            foodColorGroup.classList.add('hidden');
        }
    }
    
    // Show toast notification
    function showToast(message) {
        const toastMessage = toast.querySelector('span');
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Show modal dialog
    function showModal(message) {
        const modalMessage = document.getElementById('modal-message');
        modalMessage.textContent = message;
        modal.classList.add('show');
    }
    
    // Validate custom grid size
    function validateGridSize(rows, cols) {
        const maxSize = 80;
        
        if (rows > maxSize || cols > maxSize) {
            showModal(`Maximum grid size is ${maxSize}x${maxSize}. Please enter smaller values.`);
            return false;
        }
        
        if (rows < 5 || cols < 5) {
            showModal('Minimum grid size is 5x5. Please enter larger values.');
            return false;
        }
        
        return true;
    }
    
    // Load saved settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('snakeGameSettings')) || {};
        
        // Grid settings
        if (settings.gridSize) {
            gridSizeSelect.value = settings.gridSize;
            if (settings.gridSize === 'custom') {
                customRowsInput.value = settings.rows || 15;
                customColsInput.value = settings.cols || 15;
                customSizeGroup.classList.remove('hidden');
            }
        }
        
        // Color settings
        if (settings.gridColor1) document.getElementById('grid-color1').value = settings.gridColor1;
        if (settings.gridColor2) document.getElementById('grid-color2').value = settings.gridColor2;
        if (settings.gridBorderColor) document.getElementById('grid-border-color').value = settings.gridBorderColor;
        
        // Snake settings
        if (settings.snakeSpeed) document.getElementById('snake-speed').value = settings.snakeSpeed;
        if (settings.snakeBodyColor) document.getElementById('snake-body-color').value = settings.snakeBodyColor;
        if (settings.snakeBodyBorder) document.getElementById('snake-body-border').value = settings.snakeBodyBorder;
        if (settings.snakeHeadColor) document.getElementById('snake-head-color').value = settings.snakeHeadColor;
        if (settings.snakeHeadBorder) document.getElementById('snake-head-border').value = settings.snakeHeadBorder;
        if (settings.snakeTailColor) document.getElementById('snake-tail-color').value = settings.snakeTailColor;
        if (settings.snakeTailBorder) document.getElementById('snake-tail-border').value = settings.snakeTailBorder;
        
        // Food settings
        if (settings.foodType) {
            document.getElementById('food-type').value = settings.foodType;
            if (settings.foodType === 'color') {
                document.getElementById('food-color').value = settings.foodColor || '#ff0000';
                foodColorGroup.classList.remove('hidden');
            }
        }
    }
    
    // Apply settings and save to localStorage
    function applySettings() {
        let rows, cols;
        
        if (gridSizeSelect.value === 'custom') {
            rows = parseInt(customRowsInput.value);
            cols = parseInt(customColsInput.value);
            
            if (!validateGridSize(rows, cols)) {
                return;
            }
        } else {
            rows = gridSizeSelect.value === 'small' ? 10 :
                  gridSizeSelect.value === 'medium' ? 15 : 20;
            cols = rows;
        }
        
        const settings = {
            // Grid settings
            gridSize: gridSizeSelect.value,
            rows: rows,
            cols: cols,
            gridColor1: document.getElementById('grid-color1').value,
            gridColor2: document.getElementById('grid-color2').value,
            gridBorderColor: document.getElementById('grid-border-color').value,
            
            // Snake settings
            snakeSpeed: document.getElementById('snake-speed').value,
            snakeSpeedValue: getSpeedValue(document.getElementById('snake-speed').value),
            snakeBodyColor: document.getElementById('snake-body-color').value,
            snakeBodyBorder: document.getElementById('snake-body-border').value,
            snakeHeadColor: document.getElementById('snake-head-color').value,
            snakeHeadBorder: document.getElementById('snake-head-border').value,
            snakeTailColor: document.getElementById('snake-tail-color').value,
            snakeTailBorder: document.getElementById('snake-tail-border').value,
            
            // Food settings
            foodType: document.getElementById('food-type').value,
            foodColor: document.getElementById('food-color').value
        };
        
        localStorage.setItem('snakeGameSettings', JSON.stringify(settings));
        showToast('Settings saved successfully!');
        
        // Redirect after a slight delay so user can see the toast
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
    
    // Helper function to get speed value in milliseconds
    function getSpeedValue(speed) {
        switch(speed) {
            case 'slow': return 200;
            case 'medium': return 100;
            case 'fast': return 70;
            case 'very-fast': return 40;
            default: return 100;
        }
    }
    
    // Reset to default settings
    function resetSettings() {
        showModal('Are you sure you want to reset all settings to default?', () => {
            localStorage.removeItem('snakeGameSettings');
            loadDefaults();
            showToast('Settings reset to defaults');
        });
    }
    
    // Load default settings
    function loadDefaults() {
        // Grid settings
        gridSizeSelect.value = 'medium';
        customSizeGroup.classList.add('hidden');
        customRowsInput.value = 15;
        customColsInput.value = 15;
        document.getElementById('grid-color1').value = '#e8f5e9';
        document.getElementById('grid-color2').value = '#c8e6c9';
        document.getElementById('grid-border-color').value = '#ff0000';
        
        // Snake settings
        document.getElementById('snake-speed').value = 'medium';
        document.getElementById('snake-body-color').value = '#4CAF50';
        document.getElementById('snake-body-border').value = '#000000';
        document.getElementById('snake-head-color').value = '#4CAF50';
        document.getElementById('snake-head-border').value = '#000000';
        document.getElementById('snake-tail-color').value = '#66bb6a';
        document.getElementById('snake-tail-border').value = '#000000';
        
        // Food settings
        document.getElementById('food-type').value = 'image';
        document.getElementById('food-color').value = '#ff0000';
        foodColorGroup.classList.add('hidden');
    }
    
    // Cancel changes and go back
    function cancelChanges() {
        showModal('Discard all changes?', () => {
            window.location.href = '/';
        });
    }
});