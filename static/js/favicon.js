// Function to update favicon with current theme colors
function updateFavicon() {
  // Get current CSS variable values
  const styles = getComputedStyle(document.documentElement);
  const textColor = styles.getPropertyValue('--text-color').trim();
  const accentColor = styles.getPropertyValue('--accent-color').trim();
  const tertiaryColor = styles.getPropertyValue('--tertiary-color').trim();
  const borderColor = styles.getPropertyValue('--border-color').trim();

  // Fetch the SVG file
  fetch("{{ url_for('static', filename='img/logo.svg') }}")
    .then(response => response.text())
    .then(svgText => {
      // Replace CSS variables with current theme colors
      const coloredSVG = svgText
        .replace(/var\(--text-color\)/g, textColor)
        .replace(/var\(--accent-color\)/g, accentColor)
        .replace(/var\(--tertiary-color\)/g, tertiaryColor)
        .replace(/var\(--border-color\)/g, borderColor);

      // Update favicon
      const favicon = document.querySelector("link[rel='icon']") || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = 'data:image/svg+xml,' + encodeURIComponent(coloredSVG);
      document.head.appendChild(favicon);
    });
}

// Update favicon on:
// - Initial page load
document.addEventListener('DOMContentLoaded', updateFavicon);

// - When CSS variables change (e.g., theme toggle)
const observer = new MutationObserver(updateFavicon);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['style', 'class']
});

// - When OS color scheme changes
window.matchMedia('(prefers-color-scheme: dark)').addListener(updateFavicon);