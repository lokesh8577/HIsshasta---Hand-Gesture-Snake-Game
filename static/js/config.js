// Firebase configuration will be loaded from server
let firebaseConfig = {};

// Function to get Firebase config from server
async function getFirebaseConfig() {
    try {
        const response = await fetch('/api/firebase-config');
        firebaseConfig = await response.json();
        
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    } catch (error) {
        console.error('Error loading Firebase config:', error);
    }
}

// Initialize Firebase config on page load
document.addEventListener('DOMContentLoaded', getFirebaseConfig);