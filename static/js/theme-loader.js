// static/js/theme-loader.js
document.addEventListener('DOMContentLoaded', function () {
    // Load saved theme
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;

        // Apply to root variables
        Object.entries(theme.colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Create dynamic style element
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-theme';
        styleElement.textContent = `:root {
            --primary-color: ${theme.colors['--primary-color']};
            --secondary-color: ${theme.colors['--secondary-color']};
            --tertiary-color: ${theme.colors['--tertiary-color']};
            --accent-color: ${theme.colors['--accent-color']};
            --text-color: ${theme.colors['--text-color']};
            --bg-color: ${theme.colors['--bg-color']};
            --border-color: ${theme.colors['--border-color']};
            --card-bg: ${theme.colors['--card-bg']};
            --snake-body: ${theme.colors['--snake-body']};
            --grid1: ${theme.colors[' --grid1']};
            --grid2: ${theme.colors[' --grid2']};



        }`;

        document.head.appendChild(styleElement);
    }
});