// theme.js

document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', function() {
            const themeName = this.getAttribute('data-theme');
            themeManager.applyTheme(themeName);
            
            // Show success message
            const message = document.createElement('div');
            message.className = 'theme-message';
            message.textContent = `"${themeName.replace('-', ' ')}" theme applied to all pages!`;
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.classList.add('fade-out');
                setTimeout(() => message.remove(), 500);
            }, 2000);
        });
    });

    document.getElementById('reset-theme').addEventListener('click', function() {
        themeManager.resetTheme();
        
        // Show success message
        const message = document.createElement('div');
        message.className = 'theme-message';
        message.textContent = 'Default theme restored on all pages!';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => message.remove(), 500);
        }, 2000);
    });
});