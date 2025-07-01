let cameraActive = false;
        let processingActive = false;
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const processBtn = document.getElementById('processBtn');
        const statusText = document.getElementById('statusText');
        const videoFeed = document.getElementById('videoFeed');

        function toggleCamera() {
            if (!cameraActive) {
                // Start camera
                fetch('/camera_control/start')
                    .then(response => response.json())
                    .then(data => {
                        cameraActive = true;
                        videoFeed.src = "/video_feed?" + new Date().getTime();
                        startBtn.disabled = true;
                        stopBtn.disabled = false;
                        processBtn.disabled = false;
                        statusText.textContent = "Camera: On | Processing: Off";
                        statusText.style.color = "green";
                    });
            } else {
                // Stop camera
                fetch('/camera_control/stop')
                    .then(response => response.json())
                    .then(data => {
                        cameraActive = false;
                        processingActive = false;
                        videoFeed.src = "";
                        startBtn.disabled = false;
                        stopBtn.disabled = true;
                        processBtn.disabled = true;
                        processBtn.textContent = "Enable Processing";
                        statusText.textContent = "Camera: Off | Processing: Off";
                        statusText.style.color = "red";
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
                    });
            } else {
                // Disable processing
                fetch('/camera_control/disable_processing')
                    .then(response => response.json())
                    .then(data => {
                        processingActive = false;
                        processBtn.textContent = "Enable Processing";
                        statusText.textContent = "Camera: On | Processing: Off";
                    });
            }
        }

        // Auto-reconnect if stream fails
        videoFeed.onerror = function() {
            if (cameraActive) {
                videoFeed.src = "/video_feed?" + new Date().getTime();
            }
        };




        