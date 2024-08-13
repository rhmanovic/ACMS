function previewImage(event) {
  var reader = new FileReader();
  reader.onload = function() {
    var output = document.getElementById('imagePreview');
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Quill editors
  var quill32 = new Quill('#editor32', {
    theme: 'snow',
    modules: {
      toolbar: '#toolbar-container32'
    }
  });

  var quill33 = new Quill('#editor33', {
    theme: 'snow',
    modules: {
      toolbar: '#toolbar-container33'
    }
  });

  // Retrieve and set the descriptions from the hidden inputs
  var descriptionAr = document.getElementById('hiddenDescriptionAr').value;
  var descriptionEn = document.getElementById('hiddenDescriptionEn').value;
  quill32.clipboard.dangerouslyPasteHTML(descriptionAr);
  quill33.clipboard.dangerouslyPasteHTML(descriptionEn);

  // Add event listener for form submission
  document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    document.getElementById('hiddenDescriptionAr').value = quill32.root.innerHTML;
    document.getElementById('hiddenDescriptionEn').value = quill33.root.innerHTML;

    const form = event.target;
    const formData = new FormData(form);

    // Manually set the 'options' value to a boolean
    const optionsCheckbox = form.querySelector('#options');
    formData.set('options', optionsCheckbox.checked ? 'true' : 'false');

    // Send the FormData object directly without converting to JSON
    fetch('/manager/products', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      if (response.redirected) {
        // If the response is a redirect, manually redirect the browser
        window.location.href = response.url;
      } else {
        return response.json();
      }
    })
    .then(data => {
      if (data) {
        console.log('Success:', data);
        // Handle success (e.g., show a success message, redirect, etc.)
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      // Handle error (e.g., show an error message)
    });
  });

  // The rest of your script code remains unchanged

  document.querySelector('#bigform').addEventListener('click', function() {
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
        var thetab = document.getElementById(`${tab}-tab`);
        thetab.classList.add('text-danger');
      } else {
        var thetab = document.getElementById(`${tab}-tab`);
        thetab.classList.remove('text-danger');
      }
    }
  });

  const updateUrlHash = (hash) => history.pushState(null, null, '#' + hash);
  const activateTabAndPane = (tabId) => {
    const targetId = tabId.replace('-tab', '');
    const tabToActivate = document.getElementById(tabId);
    const tabPaneToActivate = document.getElementById(targetId);

    if (tabToActivate && tabPaneToActivate) {
      document.querySelectorAll('.theTab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));

      tabToActivate.classList.add('active');
      tabPaneToActivate.classList.add('show', 'active');
    }
  };

  const tabs = document.querySelectorAll('.theTab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.id;
      updateUrlHash(tabId.replace('-tab', ''));
      activateTabAndPane(tabId);
    });
  });

  // Check URL hash on load and activate the appropriate tab
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    activateTabAndPane(`${initialHash}-tab`);
  }
});
