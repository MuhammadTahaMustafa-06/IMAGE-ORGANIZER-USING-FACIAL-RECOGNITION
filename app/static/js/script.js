   // Function to handle image upload
   let imageData = null;
let reader = null;

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    reader = new FileReader();
    reader.onload = function () {
        document.getElementById('preview-img').src = reader.result;
        imageData = reader.result;
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
               video.remove(); // Use `remove()` to remove the video element
               imagePreview.appendChild(canvas); // Append canvas directly

               canvas.toBlob(function (blob) {
                   const reader = new FileReader();
                   reader.onloadend = function () {
                       imageData = reader.result;
                   };
                   reader.readAsDataURL(blob);
               }, 'image/png');
           }, 3000);
       });
   }

   // Function to send data to the backend
   async function sendToBackend(imageData) {
       // Sanitize and validate the imageData if needed

       document.getElementById('loading').style.display = 'block';
       const loadingSpinner = document.getElementById('loading');
       loadingSpinner.style.display = 'inline-block'; // Display spinner

       try {
           const response = await fetch('/process_image', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: 'image=' + encodeURIComponent(imageData),
           });

           if (!response.ok) {
               throw new Error('Network response was not ok');
           }

           const blob = await response.blob();
           const url = window.URL.createObjectURL(blob);
           const a = document.createElement('a');
           a.href = url;
           a.download = 'extracted_images.zip';
           document.body.appendChild(a);
           a.click();
           window.URL.revokeObjectURL(url);
       } catch (error) {
           console.error('Error:', error);
           // Show user-friendly error message if needed
       } finally {
           document.getElementById('loading').style.display = 'none';
       }
   }

   // Event listeners
   document.getElementById('upload-input').addEventListener('change', handleImageUpload);
   document.getElementById('capture-btn').addEventListener('click', captureImage);
   document.getElementById('submit-btn').addEventListener('click', () => {
       sendToBackend(imageData);
       console.log("send data")
     }
   )
   document.getElementById('remove-btn').addEventListener('click', async() => {
    document.getElementById('preview-img').src = "https://cdn.vectorstock.com/i/preview-1x/90/36/add-user-icon-design-blank-avatar-placeholder-vector-34269036.webp";
     
});