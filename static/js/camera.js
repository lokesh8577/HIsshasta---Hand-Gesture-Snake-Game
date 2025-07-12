let cameraActive = false;
let processingActive = false;
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const processBtn = document.getElementById('processBtn');
const statusText = document.getElementById('statusText');
const videoFeed = document.getElementById('videoFeed');
const placeholder = document.getElementById('cameraPlaceholder');

function toggleCamera() {
    if (!cameraActive) {
        // Start camera
        fetch('/camera_control/start')
            .then(response => response.json())
            .then(data => {
                cameraActive = true;
                videoFeed.style.display = "block";
                placeholder.style.display = "none";
                videoFeed.src = "/video_feed?" + new Date().getTime();
                startBtn.disabled = true;
                stopBtn.disabled = false;
                processBtn.disabled = false;
                statusText.textContent = "Camera: On | Processing: Off";
                statusText.style.color = "#2ecc71"; // Green to match start button
                statusText.style.display = "block";
            });
    } else {
        // Stop camera
        fetch('/camera_control/stop')
            .then(response => response.json())
            .then(data => {
                cameraActive = false;
                processingActive = false;
                videoFeed.style.display = "none";
                placeholder.style.display = "block";
                videoFeed.src = "";
                startBtn.disabled = false;
                stopBtn.disabled = true;
                processBtn.disabled = true;
                processBtn.textContent = "Enable Processing";
                statusText.textContent = "Camera: Off | Processing: Off";
                statusText.style.color = "#e74c3c"; // Red to match stop button
            });
    }
}

function toggleProcessing() {
    if (!processingActive) {
        // Enable processing
        fetch('/camera_control/enable_processing')
            .then(response => response.json())
            .then(data => {
                processingActive = true;
                processBtn.textContent = "Disable Processing";
                statusText.textContent = "Camera: On | Processing: On";
                statusText.style.color = "#3498db"; // Blue to match process button
            });
    } else {
        // Disable processing
        fetch('/camera_control/disable_processing')
            .then(response => response.json())
            .then(data => {
                processingActive = false;
                processBtn.textContent = "Enable Processing";
                statusText.textContent = "Camera: On | Processing: Off";
                statusText.style.color = "#2ecc71"; // Green (camera is still on)
            });
    }
}
function stopCamera() {
    if (cameraActive) {
        fetch('/camera_control/stop')
            .then(response => response.json())
            .then(data => {
                cameraActive = false;
                processingActive = false;
                videoFeed.style.display = "none";
                placeholder.style.display = "block";
                videoFeed.src = "";
                startBtn.disabled = false;
                stopBtn.disabled = true;
                processBtn.disabled = true;
                processBtn.textContent = "Enable Processing";
                statusText.textContent = "Camera: Off | Processing: Off";
                statusText.style.color = "#e74c3c";
            });
    }
}

// Auto-reconnect if stream fails
videoFeed.onerror = function() {
    if (cameraActive) {
        videoFeed.style.display = "block";
        placeholder.style.display = "none";
        videoFeed.src = "/video_feed?" + new Date().getTime();
    }
};
window.stopCamera = stopCamera;
window.addEventListener('beforeunload', function() {
    if (cameraActive) {
        stopCamera();
    }
});
