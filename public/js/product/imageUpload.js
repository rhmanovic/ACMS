window.imageFiles = []; // Declare imageFiles as a global variable
const fileInput = document.getElementById('product_images');
const imagePreviewList = document.getElementById('image-preview-list');

fileInput.addEventListener('change', function() {
  const file = fileInput.files[0];

  if (file) {
    imageFiles.push(file); // Add the selected file to the global array

    const reader = new FileReader();
    reader.onload = function(e) {
      const li = document.createElement('li');
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Uploaded Image';
      img.width = 150;

      li.appendChild(img);
      imagePreviewList.appendChild(li);
    };

    reader.readAsDataURL(file);
    fileInput.value = '';
  }
});
