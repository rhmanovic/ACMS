document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Quill content
    const quillInputs = ['#hiddenDescriptionAr', '#hiddenDescriptionEn'];
    quillInputs.forEach(hiddenInput => {
      formData.set(hiddenInput.replace('#', ''), document.querySelector(hiddenInput).value);
    });

    // Image files (now accessible via global scope)
    imageFiles.forEach((file) => {
      formData.append('product_images', file);
    });

    formData.set('options', form.querySelector('#options').checked ? 'true' : 'false');
    formData.set('standard_sizes', form.querySelector('#standard_sizes').checked ? 'true' : 'false');

    fetch('/manager/products', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        return response.json();
      }
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
});
