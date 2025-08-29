// Main navigation functionality
document.addEventListener('DOMContentLoaded', function () {
    // Select elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');
    const menuIcon = document.querySelector('.menu-icon');
    const body = document.body;
    const navLinks = document.querySelectorAll('.nav-link');
    const notificationBtn = document.querySelector('.notification-btn');
    const notificationPopup = document.querySelector('.notification-popup');
    const closePopup = document.querySelector('.close-popup');
    const popupOverlay = document.querySelector('.popup-overlay');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Toggle popup
    function togglePopup() {
        notificationPopup.classList.toggle('active');
        popupOverlay.classList.toggle('active');
        document.body.style.overflow = notificationPopup.classList.contains('active') ? 'hidden' : '';
    }

    // Open popup when notification button is clicked
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePopup();
        });
    }

    // Close popup
    if (closePopup) {
        closePopup.addEventListener('click', togglePopup);
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', togglePopup);
    }

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!notificationPopup.contains(e.target) && e.target !== notificationBtn) {
            if (notificationPopup.classList.contains('active')) {
                togglePopup();
            }
        }
    });

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


    // Footer button handlers


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
            profileBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                profileWindow.classList.toggle('hidden');
            });

            // Close when clicking outside
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.profile-container')) {
                    profileWindow.classList.add('hidden');
                }
            });
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
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



function handleResize() {
    initCanvas();

    // Adjust mobile controls position if needed
    if (window.innerWidth <= 768) {
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls && currentControlMode === 'keyboard') {
            mobileControls.classList.remove('hidden');
        }
    }
}

window.addEventListener('resize', handleResize);