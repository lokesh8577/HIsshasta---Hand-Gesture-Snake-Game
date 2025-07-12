
        const snakeEngine = document.getElementById('snake-engine');
        const segments_snake = [];
        const segmentCount_snake = 25;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        
        // Create snake
        function createSnake() {
            for (let i = 0; i < segmentCount_snake; i++) {
                const segment = document.createElement('div');
                segment.className = 'snake-segment';
                if (i === 0) segment.classList.add('snake-head');
                snakeEngine.appendChild(segment);
                segments_snake.push({
                    element: segment,
                    x: mouseX,
                    y: mouseY,
                    tx: mouseX,
                    ty: mouseY
                });
            }
        }
        
        // Animate with smooth physics
        function animateSnake() {
            const speed = 0.13;
            const spacing = 15;
            
            segments_snake[0].tx = mouseX;
            segments_snake[0].ty = mouseY;
            
            segments_snake.forEach((seg, i) => {
                if (i > 0) {
                    const prev = segments_snake[i-1];
                    const angle = Math.atan2(prev.y - seg.y, prev.x - seg.x);
                    seg.tx = prev.x - Math.cos(angle) * spacing;
                    seg.ty = prev.y - Math.sin(angle) * spacing;
                }
                
                seg.x += (seg.tx - seg.x) * speed;
                seg.y += (seg.ty - seg.y) * speed;
                
                seg.element.style.left = `${seg.x}px`;
                seg.element.style.top = `${seg.y}px`;
                
                // Rotate head
                if (i === 0) {
                    const nextSeg = segments_snake[1];
                    const rotation = Math.atan2(nextSeg.y - seg.y, nextSeg.x - seg.x) * 180 / Math.PI;
                    seg.element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                }
            });
            
            requestAnimationFrame(animateSnake);
        }
        
        // === ENHANCED QUANTUM FIELD ===
        function createQuantumField() {
            const field = document.querySelector('.quantum-field');
            const particleCount = 40;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'quantum-particle';
                
                // Random properties
                const size = Math.random() * 5 + 8;
                const posX = Math.random() * 1000;
                const delay = Math.random() * 15;
                const duration = Math.random() * 10 + 10;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}%`;
                particle.style.bottom = `-10px`;
                particle.style.animationDuration = `${duration}s`;
                particle.style.animationDelay = `${delay}s`;
                
                // Some particles glow more
                if (Math.random() > 0.7) {
                    particle.style.boxShadow = `0 0 10px var(--neon-blue)`;
                }
                
                field.appendChild(particle);
            }
        }
        
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Original functionality
        document.getElementById('keyboard-btn').addEventListener('click', () => {
            console.log("Keyboard selected");
        });
        
        document.getElementById('gesture-btn').addEventListener('click', () => {
            console.log("Gestures selected");
        });
        
        // Snake reacts to gesture button hover
       
        
        
        // Initialize
        window.addEventListener('load', () => {
            createSnake();
            animateSnake();
            createQuantumField();
        });