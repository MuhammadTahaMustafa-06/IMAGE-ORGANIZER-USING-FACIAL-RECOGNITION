// Function to handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById('preview-img').src = reader.result;
        sendToBackend(reader.result);
    };
    reader.readAsDataURL(file);
}

// Function to handle capturing an image
function captureImage() {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext('2d');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        });

    video.addEventListener('loadedmetadata', function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const intervalId = setInterval(function () {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            previewImg.src = canvas.toDataURL('image/png');
        }, 100);

        // Clear interval and release resources when done
        setTimeout(function () {
            clearInterval(intervalId);
            video.srcObject.getTracks().forEach(track => track.stop());
            imagePreview.removeChild(video);
            imagePreview.appendChild(canvas);

            canvas.toBlob(function (blob) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    sendToBackend(reader.result);
                };
                reader.readAsDataURL(blob);
            }, 'image/png');
        }, 3000); // Example: Capture image for 3 seconds
    });
}

// Function to send data to the backend
function sendToBackend(imageData) {
    // Sanitize and validate the imageData if needed

    document.getElementById('loading').style.display = 'block';

    fetch('/process_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'image=' + encodeURIComponent(imageData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'extracted_images.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.getElementById('loading').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('loading').style.display = 'none';
            // Show user-friendly error message if needed
        });
}

// Event listeners
document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('upload-input').click();
});

document.getElementById('upload-input').addEventListener('change', handleImageUpload);
document.getElementById('capture-btn').addEventListener('click', captureImage);

document.getElementById('upload-btn').addEventListener('click', () => {
    document.getElementById('upload-input').click();
});

document.getElementById('upload-input').addEventListener('change', handleImageUpload);
document.getElementById('capture-btn').addEventListener('click', captureImage);

