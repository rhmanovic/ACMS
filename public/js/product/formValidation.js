document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#bigform').addEventListener('click', function() {
    const errors = [];
    const tabsCount = { tab1: 0, tab2: 0, tab3: 0, tab4: 0 };
    const requiredFields = document.querySelectorAll('input[required], select[required]');

    requiredFields.forEach(field => {
      const spanLocalError = field.parentElement.querySelector('.spanLocalError');
      if (!field.value.trim()) {
        const itstab = field.getAttribute('itstab');
        tabsCount[itstab]++;
        errors.push('الرجاء تعبئة: ' + (field.placeholder || field.getAttribute('placeholderselect')));
        spanLocalError.classList.remove('hidden');
        field.classList.add('border-danger');
      } else {
        spanLocalError.classList.add('hidden');
        field.classList.remove('border-danger');
      }
    });

    const errorContainer = document.getElementById('textValidationError');
    errorContainer.innerHTML = errors.length > 0 ? `<ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>` : '';
    errorContainer.style.display = errors.length > 0 ? 'block' : 'none';

    Object.keys(tabsCount).forEach(tab => {
      document.getElementById(`${tab}-tab`).classList.toggle('text-danger', tabsCount[tab] > 0);
    });
  });
});
