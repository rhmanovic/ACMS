document.getElementById('formbutton').addEventListener('click', function(event) {
  

  var bigform = document.querySelector('#bigform');

  let errors = [];
  const requiredFields = document.querySelectorAll('input[required], select[required]');

  var tabsCount = {
    tab1: 0,
    tab2: 0,
    tab3: 0,
    tab4: 0
  };

  requiredFields.forEach(field => {
    var spanLocalError = field.parentElement.querySelector('.spanLocalError');
    const formcontrol = field.parentElement.querySelector('.form-control');

    if (!field.value.trim()) {
      const itstab = field.getAttribute('itstab');
      tabsCount[itstab] += 1; // Increment only if itstab is a valid key in tabsCount

      errors.push('الرجاء تعبئة: ' + (field.placeholder || field.getAttribute('placeholderselect')));
      spanLocalError.classList.remove('hidden');
      field.classList.add('border-danger');
    } else {
      if (spanLocalError) spanLocalError.classList.add('hidden');
      if (field) field.classList.remove('border-danger');
    }
  });

  const errorContainer = document.getElementById('textValidationError');
  errorContainer.innerHTML = ''; // Clear previous errors

  if (errors.length > 0) {
    event.preventDefault(); // Prevent form submission
    const ul = document.createElement('ul');
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      ul.appendChild(li);
    });
    errorContainer.appendChild(ul);
    errorContainer.style.display = 'block';
  } else {
    errorContainer.style.display = 'none';
  }

  for (const tab in tabsCount) {
    if (tabsCount[tab] > 0) {
      var thetab= document.getElementById(`${tab}-tab`);
      thetab.classList.add('text-danger');
    } else {
      var thetab= document.getElementById(`${tab}-tab`);
      thetab.classList.remove('text-danger');
    }
  }
});
