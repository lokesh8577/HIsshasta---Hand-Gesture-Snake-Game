// Enhanced device detection
function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 1024;
    
    return isMobile || isTablet || isSmallScreen;
}

// Check if current page is permission page
function isPermissionPage() {
    return window.location.pathname === '/permission' || 
           window.location.pathname.endsWith('permission.html');
}

// Redirect logic
function checkDeviceAndRedirect() {
    // Don't redirect if already on permission page
    if (isPermissionPage()) return;
    
    if (isMobileDevice()) {
        // Check if we're trying to access the main pages
        if (window.location.pathname === '/' || 
            window.location.pathname === '/index' ||
            window.location.pathname.endsWith('index.html')) {
            window.location.href = '/permission';
        }
    }
}

// Run checks
document.addEventListener('DOMContentLoaded', checkDeviceAndRedirect);
window.addEventListener('resize', checkDeviceAndRedirect);

// Additional check for direct access to other pages
window.addEventListener('load', function() {
    if (isMobileDevice() && !isPermissionPage()) {
        window.location.href = '/permission';
    }
});