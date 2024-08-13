// customerForm.js



// Elements
const theid = document.getElementById('theid');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const password = document.getElementById('password');
const formButton = document.getElementById('formbutton');
const confirmPassword = document.getElementById('confirmPassword');
const requiredFields = document.querySelectorAll('input[required], select[required]');

// Error elements
const phoneError = document.getElementById('phoneError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const textValidationErrorul = document.getElementById('textValidationErrorul');
const phoneRequired = document.getElementById('phoneRequired');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const confirmPasswordError2 = document.getElementById('confirmPasswordError2');

// Error  required elements
const passwordRequired = document.getElementById('passwordRequired');
const passwordConfirmRequired = document.getElementById('passwordConfirmRequired');

// Password Functions
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;

    // Allow only numeric characters and backspace
    if (charCode < 48 || charCode > 57) {
        return false;
    }
    return true;
}

function validatePassword() {

  // Check if password is empty
  if (password.value.length === 0 & theid.value.length != 24) {
    passwordRequired.classList.remove('hidden');
    password.classList.add('border-danger');
  } else {
    passwordRequired.classList.add('hidden');
    password.classList.remove('border-danger');
  }
  
  const hasSixNumbers = password.value.length >= 6;
  if (!hasSixNumbers &&  password.value.length != 0) {
    event.preventDefault(); // Prevent form submission
    passwordError.textContent = 'Password must contain at least 6 number or letter.';
    passwordError.style.display = 'block';
    passwordError.classList.add('vibrate');
    setTimeout(() => passwordError.classList.remove('vibrate'), 300);
  } else {
    passwordError.style.display = 'none';
  }
  if (confirmPassword.value.length != 0){
    validateConfirmPassword();
  }
  
}

function validateConfirmPassword() {
  const hasSixNumbersConfirmPassword = confirmPassword.value.length >= 6;

  // Check if confirmPassword is empty
  if (confirmPassword.value.length === 0 &&  password.value.length != 0) {
      passwordConfirmRequired.classList.remove('hidden');
      confirmPassword.classList.add('border-danger');
  } else {
      passwordConfirmRequired.classList.add('hidden');
      confirmPassword.classList.remove('border-danger');
  }
  
  if (password.value !== confirmPassword.value  &&  password.value.length != 0) {
    event.preventDefault(); // Prevent form submission
    confirmPasswordError.textContent = 'Passwords do not match.';
    confirmPasswordError.style.display = 'block';
    confirmPasswordError.classList.add('vibrate');
    setTimeout(() => confirmPasswordError.classList.remove('vibrate'), 300);
  } else {
    confirmPasswordError.style.display = 'none';
  }

  if (!hasSixNumbersConfirmPassword &&  password.value.length != 0) {
    event.preventDefault(); // Prevent form submission
    confirmPasswordError2.textContent = 'Confirm Password must contain at least 6 numbers or letters.';
    confirmPasswordError2.style.display = 'block';
    confirmPasswordError2.classList.add('vibrate');
    setTimeout(() => confirmPasswordError2.classList.remove('vibrate'), 300);
  } else {
    confirmPasswordError2.style.display = 'none';
  } 

 

}



// Phone Function
function validatePhone() {
  const isEightDigits = phone.value.replace(/[^0-9]/g, "").length === 8;

  // Check if password is empty
  if (phone.value.length === 0) {
    event.preventDefault(); // Prevent form submission
    phoneRequired.classList.remove('hidden');
    phone.classList.add('border-danger');
  } else {
    phoneRequired.classList.add('hidden');
    phone.classList.remove('border-danger');
  }

  if (!isEightDigits) {
    event.preventDefault(); // Prevent form submission
    phoneError.textContent = 'يجب أن يحتوي رقم الهاتف على 8 أرقام بالضبط.';
    phoneError.classList.remove('hidden');
    phoneError.classList.add('vibrate');
    setTimeout(() => phoneError.classList.remove('vibrate'), 300);

  } else {
    phoneError.classList.add('hidden');
  }
  
}

// country Function
function validateCountry(){
  const country = document.getElementById('country');
  const countryError = document.getElementById('countryError');

  if (country.value.length === 0) {
    event.preventDefault(); // Prevent form submission
    countryError.classList.remove('hidden');
    countryError.classList.add('vibrate');
    country.classList.add('border-danger');
    setTimeout(() => countryError.classList.remove('vibrate'), 300);

  } else {
    countryError.classList.add('hidden');
    country.classList.remove('border-danger');
  }
}


// addEventListener
phone.addEventListener('input', validatePhone);
confirmPassword.addEventListener('input', validateConfirmPassword);
password.addEventListener('input', function() {
  validatePassword();
});
country.addEventListener('input', function() {
  validateCountry();
});





document.getElementById('formbutton').addEventListener('click', function(event) {  
  validatePhone();
  
  validateCountry()

  if (theid.value.length === 24 && password.value.length === 0) {
    
  } else {
    validatePassword();
    validateConfirmPassword();
  }
});


// Email Function
// function validateEmail() {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//   // Check if email is empty
//   if (email.value.length === 0){
//     emailError.textContent = 'يجب أن يحتوي البريد الإلكتروني على عنوان بريد إلكتروني.';
//     emailError.classList.remove('hidden');
//     emailError.classList.add('vibrate');
//     setTimeout(() => emailError.classList.remove('vibrate'), 300);

//   } else {
//     emailError.classList.add('hidden');
//   }
//   if (!emailRegex.test(email.value)){
//     emailError.textContent = 'يجب أن يحتوي البريد الإلكتروني على عنوان بريد إلكتروني.';
//     emailError.classList.remove('hidden');
//     emailError.classList.add('vibrate');
//     setTimeout(() => emailError.classList.remove('vibrate'), 300);
//   } else{
//     emailError.classList.add('hidden');
//   }
// }