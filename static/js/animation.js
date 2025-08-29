document.addEventListener('DOMContentLoaded', function () {
    const snakeContainer = document.querySelector('.snake-container');
    const snakeTrack = document.createElement('div');
    snakeTrack.className = 'snake-track';

    const snake = document.createElement('div');
    snake.className = 'snake';

    // Create snake head


    // Create snake body (15 segments)


    snakeTrack.appendChild(snake);
    snakeContainer.appendChild(snakeTrack);
    // snakeOverContainer.appendChild(snakeTrack);

    // Add some food dots
    for (let i = 0; i < 5; i++) {
        const food = document.createElement('div');
        food.className = 'food';
        food.style.left = `${Math.random() * 90 + 5}%`;
        food.style.top = `${Math.random() * 90 + 5}%`;
        food.style.animationDelay = `${Math.random() * 5}s`;
        snakeContainer.appendChild(food);
        // snakeOverContainer.appendChild(food);
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const snakeOverContainer = document.querySelector('.snake-over-container');
    const snakeTrack = document.createElement('div');
    snakeTrack.className = 'snake-track';

    const snake = document.createElement('div');
    snake.className = 'snake';




    snakeTrack.appendChild(snake);

    snakeOverContainer.appendChild(snakeTrack);

    // Add some food dots
    for (let i = 0; i < 5; i++) {
        const food = document.createElement('div');
        food.className = 'food';
        food.style.left = `${Math.random() * 90 + 5}%`;
        food.style.top = `${Math.random() * 90 + 5}%`;
        food.style.animationDelay = `${Math.random() * 5}s`;
        snakeOverContainer.appendChild(food);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const gestureBtn = document.getElementById('gesture-btn');
    const segments = document.querySelectorAll('.snake-selection-decoration__segment');

    gestureBtn.addEventListener('mouseenter', () => {
        segments.forEach(seg => {
            seg.style.background = 'var(--tertiary-color)';
            seg.style.opacity = '0.6';
            seg.style.transform = 'scale(1.5)';
        });
    });

    gestureBtn.addEventListener('mouseleave', () => {
        segments.forEach(seg => {
            seg.style.background = 'var(--accent-color)';
            seg.style.opacity = '0.3';
            seg.style.transform = 'scale(1)';
        });
    });
});
