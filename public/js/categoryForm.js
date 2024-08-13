document.querySelector('#bigform').addEventListener('click', function() {
  
  var bigform = document.querySelector('#bigform')

 


  let errors = [];
  const requiredFields = document.querySelectorAll('input[required], select[required]');

  

  requiredFields.forEach(field => {
    
    
    var spanLocalError = field.parentElement.querySelector('.spanLocalError');
    const formcontrol = field.parentElement.querySelector('.form-control');

    
    
    
    if (!field.value.trim()) {

      
      
      
      
      
      

      

      
      errors.push('الرجاء تعبئة: ' + (field.placeholder || field.getAttribute('placeholderselect')));

      
      
      spanLocalError.classList.remove('hidden');
      field.classList.add('border-danger');

    } else {
      if (spanLocalError) spanLocalError.classList.add('hidden');
      if (field) field.classList.remove('border-danger');
      
      console.log("field");
      console.log(field);
    }


    
  });

  

  const errorContainer = document.getElementById('textValidationError');
  errorContainer.innerHTML = ''; // Clear previous errors

  if (errors.length > 0) {
    // e.preventDefault(); // Stop form submission
    const ul = document.createElement('ul');
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      ul.appendChild(li);
    });
    errorContainer.appendChild(ul);
    // errorContainer.innerHTML = 'xx';
    errorContainer.style.display = 'block';
  } else {
    errorContainer.style.display = 'none';
  }

  
    
  
});


document.querySelector('form').addEventListener('submit', function() {
  
   
  document.getElementById('hiddenDescriptionAr').value = quill32.root.innerHTML;
  document.getElementById('hiddenDescriptionEn').value = quill33.root.innerHTML;
});

function previewImage(event) {
  var reader = new FileReader();
  reader.onload = function() {
    var output = document.getElementById('imagePreview');
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}
