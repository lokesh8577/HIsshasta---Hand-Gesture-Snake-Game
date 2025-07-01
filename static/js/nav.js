// Notification button functionality
const notifBtn = document.getElementById('notificationButton');
const notifBadge = document.getElementById('notifBadge');
if (notifBtn && notifBadge) {
  notifBtn.addEventListener('click', () => {
    // Simulate clearing notifications
    notifBadge.style.display = 'none';
    alert('Notifications cleared!');
  });
}

// Main navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    // Select elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');
    const menuIcon = document.querySelector('.menu-icon');
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link');
    const notificationBtn = document.querySelector('.notification-btn');

    // Toggle menu function
    function toggleMenu() {
        if (!headerNav || !menuIcon) return;
        
        headerNav.classList.toggle('active');
        body.classList.toggle('menu-open');
        mobileMenuBtn.classList.toggle('active');

        if (headerNav.classList.contains('active')) {
            menuIcon.classList.replace('fa-bars', 'fa-times');
            animateMenuItemsIn();
        } else {
            menuIcon.classList.replace('fa-times', 'fa-bars');
            animateMenuItemsOut();
        }
    }

    // Animate menu items when opening
    function animateMenuItemsIn() {
        navLinks.forEach((link, index) => {
            link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            link.style.transitionDelay = `${index * 0.1}s`;
            link.style.opacity = '0';
            link.style.transform = 'translateX(-10px)';

            setTimeout(() => {
                link.style.opacity = '1';
                link.style.transform = 'translateX(0)';
            }, 50);
        });
    }

    // Animate menu items when closing
    function animateMenuItemsOut() {
        navLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'translateX(-10px)';
        });
    }

    // Mobile menu event listeners
    if (mobileMenuBtn && headerNav && menuIcon) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });

        document.addEventListener('click', function (e) {
            if (!headerNav.contains(e.target) && e.target !== mobileMenuBtn) {
                if (headerNav.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768 && headerNav.classList.contains('active')) {
                    setTimeout(() => toggleMenu(), 200);
                }
            });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && headerNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Notification button
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function () {
            alert('You have 3 new notifications!');
        });
    }

    // Footer button handlers
    document.querySelectorAll('.textButton').forEach(button => {
        button.addEventListener('click', function () {
            if (this.id === 'contactPopupButton') {
                alert('Contact popup would open');
            } else if (this.id === 'supportMeButton') {
                alert('Support dialog would open');
            }
        });
    });

    // Mobile command line button
    const commandLineMobileButton = document.getElementById('commandLineMobileButton');
    if (commandLineMobileButton) {
        commandLineMobileButton.addEventListener('click', function () {
            alert('Mobile command line would open');
        });
    }

    // Profile dropdown functionality
    function setupProfileDropdown() {
     const profileBtn = document.getElementById('profileBtn');
    const profileWindow = document.getElementById('profileWindow');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileBtn && profileWindow) {
        // Toggle profile window
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            profileWindow.classList.toggle('hidden');
        });

        // Close when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.profile-container')) {
                profileWindow.classList.add('hidden');
            }
        });
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fetch('/logout', { method: 'POST' })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url;
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }

    }

    // Initialize profile dropdown
    setupProfileDropdown();
});