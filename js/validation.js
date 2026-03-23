/**
 * validation.js
 * Handles all client-side form validation for the appointment
 * on form submit and in real-time on field blur.
 *
 * Validated fields: Full Name, Email, Phone, Date of Birth,
 * Gender (radio), Reason for Visit, Terms & Conditions
 *
 */

/**
 * Validates the patient's full name input.
 * Rules:
 * - Must not be empty or only whitespace
 * - Must be at least 2 characters after trimming
 * - Must not contain numbers or special characters
 *   (letters, spaces, hyphens, and apostrophes only)
 * - Regex: /^[a-zA-Z\s\-']+$/
 *
 * @param {string} value - The input value to validate
 * @returns {object} { valid: boolean, message: string }
 */
function validateName(value) {
  // Remove leading/trailing whitespace before all checks
  const trimmed = value.trim();

  // Fail if the field is empty or contains only spaces
  if (trimmed.length === 0) {
    return { valid: false, message: 'Full name is required.' };
  }

  // Fail if fewer than 2 characters — too short to be a real name
  if (trimmed.length < 2) {
    return {
      valid: false,
      message: 'Please enter your full name (at least 2 characters).'
    };
  }

  // Fail if the name contains digits or disallowed special characters
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmed)) {
    return {
      valid: false,
      message: 'Name may only contain letters, spaces, hyphens, and apostrophes.'
    };
  }

  // All checks passed
  return { valid: true, message: '' };
}

/**
 * Validates the email address format.
 * Rules:
 * - Must not be empty
 * - Must not contain spaces
 * - Must match standard email format: something@something.something
 * - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *
 * @param {string} value - The input value to validate
 * @returns {object} { valid: boolean, message: string }
 */
function validateEmail(value) {
  // Trim surrounding whitespace before checking
  const trimmed = value.trim();

  // Fail if the field is empty
  if (trimmed.length === 0) {
    return { valid: false, message: 'Email address is required.' };
  }

  // Fail if the value contains any whitespace characters
  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      message: 'Email address must not contain spaces.'
    };
  }

  // Check standard email structure: local-part @ domain . tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      message: 'Please enter a valid email address (e.g. name@example.com).'
    };
  }

  // All checks passed
  return { valid: true, message: '' };
}

/**
 * Validates the phone number.
 * Rules:
 * - Must not be empty
 * - Strip all non-digit characters first, then check length
 * - Must be between 10 and 15 digits (international numbers allowed)
 * - Regex on stripped value: /^\d{10,15}$/
 *
 * @param {string} value - The input value to validate
 * @returns {object} { valid: boolean, message: string }
 */
function validatePhone(value) {
  // Fail immediately if the raw value is blank
  if (value.trim().length === 0) {
    return { valid: false, message: 'Phone number is required.' };
  }

  // Strip formatting characters (spaces, dashes, dots, parentheses)
  // to get a clean string of digits for length validation
  const digitsOnly = value.replace(/\D/g, '');

  // Check that the digit count falls in the valid range (10–15)
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(digitsOnly)) {
    return {
      valid: false,
      message: 'Please enter a valid phone number (10–15 digits).'
    };
  }

  // All checks passed
  return { valid: true, message: '' };
}

/**
 * Validates the date of birth.
 * Rules:
 * - Must not be empty
 * - Must be a valid calendar date (parsed with new Date())
 * - Must be in the past — cannot be today or a future date
 * - Patient must be less than 120 years old (sanity upper bound)
 *
 * @param {string} value - The date string from input (YYYY-MM-DD format)
 * @returns {object} { valid: boolean, message: string }
 */
function validateDOB(value) {
  // Fail if the field is empty or blank
  if (!value || value.trim().length === 0) {
    return { valid: false, message: 'Date of birth is required.' };
  }

  // Attempt to parse the date — getTime() returns NaN for invalid dates
  const dob = new Date(value);
  if (isNaN(dob.getTime())) {
    return { valid: false, message: 'Please enter a valid date of birth.' };
  }

  // Build today's date at midnight for a clean day-level comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fail if the date of birth is today or in the future
  if (dob >= today) {
    return {
      valid: false,
      message: 'Date of birth must be in the past.'
    };
  }

  // Calculate approximate age in years for the sanity upper-bound check
  const ageInMilliseconds = today - dob;
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

  // Fail if age exceeds 120 years — almost certainly a data-entry error
  if (ageInYears >= 120) {
    return {
      valid: false,
      message: 'Please enter a valid date of birth (must be within the last 120 years).'
    };
  }

  // All checks passed
  return { valid: true, message: '' };
}

/**
 * Validates that a gender radio button is selected.
 * Reads all radio inputs with name="gender" from the DOM
 * and checks whether at least one is checked.
 *
 * @returns {object} { valid: boolean, message: string }
 */
function validateGender() {
  // Collect every radio button belonging to the gender group
  const radios = document.querySelectorAll('input[name="gender"]');

  // Iterate through each radio to check if any is selected
  let isSelected = false;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      isSelected = true;
      break;
    }
  }

  if (!isSelected) {
    return { valid: false, message: 'Please select a gender option.' };
  }

  // At least one radio is checked — validation passes
  return { valid: true, message: '' };
}

/**
 * Validates the reason for visit dropdown.
 * Rules:
 * - Must not be the empty placeholder option
 * - Value must not be an empty string, "default", or null/undefined
 *
 * @param {string} value - The currently selected option value
 * @returns {object} { valid: boolean, message: string }
 */
function validateReason(value) {
  // The placeholder option carries value="" — treat as unselected
  if (!value || value === '' || value === 'default') {
    return {
      valid: false,
      message: 'Please select a reason for your visit.'
    };
  }

  // A real option has been chosen
  return { valid: true, message: '' };
}

/**
 * Validates that the Terms & Conditions checkbox is checked.
 * Reads the checkbox element directly from the DOM by id="terms".
 *
 * @returns {object} { valid: boolean, message: string }
 */
function validateTerms() {
  // Get the checkbox element from the DOM
  const termsCheckbox = document.getElementById('terms');

  // Fail if element is missing or if it is not ticked
  if (!termsCheckbox || !termsCheckbox.checked) {
    return {
      valid: false,
      message: 'You must agree to the Terms & Conditions to proceed.'
    };
  }

  // Checkbox is ticked — validation passes
  return { valid: true, message: '' };
}

/**
 * Validates the appointment date dropdown.
 */
function validateApptDate(value) {
  if (!value || value === '' || value === 'default') {
    return {
      valid: false,
      message: 'Please select an appointment date.'
    };
  }
  return { valid: true, message: '' };
}

/**
 * Validates the time slot radio group.
 */
function validateTimeSlot() {
  const container = document.getElementById('time-slots-container');
  // If the container is hidden, the user hasn't selected a date yet
  if (!container || container.style.display === 'none') {
    return { valid: false, message: 'Please select an available time slot.' };
  }

  const radios = document.querySelectorAll('input[name="time-slot"]');
  let isSelected = false;
  for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      isSelected = true;
      break;
    }
  }

  if (!isSelected) {
    return { valid: false, message: 'Please select an available time slot.' };
  }

  return { valid: true, message: '' };
}

/* =============================================
   UI HELPER FUNCTIONS
   showError / clearError / showFieldError /
   clearFieldError — manage the visible error
   state in the DOM for each form field
   ============================================= */

/**
 * Displays an error message below a standard form field (input/select).
 * Steps:
 * 1. Gets the input element by fieldId
 * 2. Adds CSS class "error" to the input  (triggers red border in global.css)
 * 3. Removes CSS class "success" from the input
 * 4. Finds the error element with id="${fieldId}-error"; creates it if missing
 * 5. Sets the error element's text content to the provided message
 * 6. Adds class "visible" to the error element (reveals it via CSS)
 * 7. Sets aria-invalid="true" on the input for screen reader accessibility
 *
 * @param {string} fieldId  - The id attribute of the form field
 * @param {string} message  - The human-readable error message to display
 */
function showError(fieldId, message) {
  // Step 1: Locate the form field element
  const inputEl = document.getElementById(fieldId);
  if (!inputEl) return;

  // Steps 2 & 3: Switch the field's visual state to "error"
  inputEl.classList.add('error');
  inputEl.classList.remove('success');

  // Step 7: Announce to screen readers that this field is invalid
  inputEl.setAttribute('aria-invalid', 'true');

  // Step 4: Try to find the pre-existing error element in the HTML
  const errorId = fieldId + '-error';
  let errorEl = document.getElementById(errorId);

  if (!errorEl) {
    // Create a new error container and inject it right after the input
    errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'error-message';
    errorEl.setAttribute('role', 'alert');
    inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
  }

  // Steps 5 & 6: Write the error text and make the element visible
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

/**
 * Clears the error state from a standard form field (input/select).
 * Steps:
 * 1. Gets the input element by fieldId
 * 2. Removes CSS class "error" from the input
 * 3. Adds CSS class "success" to the input (triggers green border in global.css)
 * 4. Finds the error element with id="${fieldId}-error"
 * 5. Removes the "visible" class and clears the text content
 * 6. Sets aria-invalid="false" on the input
 *
 * @param {string} fieldId - The id attribute of the form field to clear
 */
function clearError(fieldId) {
  // Step 1: Locate the form field element
  const inputEl = document.getElementById(fieldId);
  if (!inputEl) return;

  // Steps 2 & 3: Switch the field's visual state to "success"
  inputEl.classList.remove('error');
  inputEl.classList.add('success');

  // Step 6: Inform screen readers this field is now valid
  inputEl.setAttribute('aria-invalid', 'false');

  // Steps 4 & 5: Hide and clear the associated error element
  const errorEl = document.getElementById(fieldId + '-error');
  if (errorEl) {
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
  }
}

/**
 * Displays an error message for non-standard fields that do not have
 * a single focusable input element (e.g. radio groups, checkboxes).
 * Finds the element with id="${containerId}-error" and makes it visible.
 * If no such element exists, it creates one and appends it to the container.
 *
 * @param {string} containerId - The id used to locate the "-error" element
 * @param {string} message     - The error message text to display
 */
function showFieldError(containerId, message) {
  // Look for the error element using the standard naming convention
  const errorId = containerId + '-error';
  let errorEl = document.getElementById(errorId);

  if (!errorEl) {
    // Build a new error element and attach it inside the named container
    const containerEl = document.getElementById(containerId);
    if (!containerEl) return;

    errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'error-message';
    errorEl.setAttribute('role', 'alert');
    containerEl.appendChild(errorEl);
  }

  // Write the message text and reveal the error element
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

/**
 * Hides and clears the error message for a non-standard field.
 * Companion to showFieldError — mirrors the behaviour of clearError
 * but does not touch any input element (no class changes on inputs).
 *
 * @param {string} containerId - The id whose "-error" element to clear
 */
function clearFieldError(containerId) {
  // Locate the error element by the standard naming convention
  const errorEl = document.getElementById(containerId + '-error');
  if (errorEl) {
    errorEl.classList.remove('visible');
    errorEl.textContent = '';
  }
}

/* =============================================
   MASTER VALIDATION FUNCTION
   Runs ALL validators in sequence and collects
   results without short-circuiting, so the user
   sees every error on a single submit attempt.
   ============================================= */

/**
 * Runs validation on every mandatory field in the booking form.
 * Calls the individual validators and uses showError / clearError
 * or showFieldError / clearFieldError to update the UI for each field.
 *
 * Validation order:
 * 1. Full name
 * 2. Email address
 * 3. Phone number
 * 4. Date of birth
 * 5. Gender (radio group)
 * 6. Reason for visit
 * 7. Terms & Conditions checkbox
 *
 * NOTE: All fields are always validated — no early return on first error.
 * This ensures the user can see every problem at once.
 *
 * @returns {boolean} true if every mandatory field is valid, false otherwise
 */
function validateForm() {
  // isValid starts true; any failing field flips it to false
  let isValid = true;

  // --- 1. Full Name ---
  const nameEl = document.getElementById('full-name');
  const nameResult = validateName(nameEl ? nameEl.value : '');
  if (nameResult.valid) {
    clearError('full-name');
  } else {
    showError('full-name', nameResult.message);
    isValid = false;
  }

  // --- 2. Email Address ---
  const emailEl = document.getElementById('email');
  const emailResult = validateEmail(emailEl ? emailEl.value : '');
  if (emailResult.valid) {
    clearError('email');
  } else {
    showError('email', emailResult.message);
    isValid = false;
  }

  // --- 3. Phone Number ---
  const phoneEl = document.getElementById('phone');
  const phoneResult = validatePhone(phoneEl ? phoneEl.value : '');
  if (phoneResult.valid) {
    clearError('phone');
  } else {
    showError('phone', phoneResult.message);
    isValid = false;
  }

  // --- 4. Date of Birth ---
  const dobEl = document.getElementById('dob');
  const dobResult = validateDOB(dobEl ? dobEl.value : '');
  if (dobResult.valid) {
    clearError('dob');
  } else {
    showError('dob', dobResult.message);
    isValid = false;
  }

  // --- 4.5 Appointment Date and Time ---
  const apptDateEl = document.getElementById('appt-date');
  if (apptDateEl) {
    const apptResult = validateApptDate(apptDateEl.value);
    if (apptResult.valid) {
      clearError('appt-date');
    } else {
      showError('appt-date', apptResult.message);
      isValid = false;
    }

    const timeSlotResult = validateTimeSlot();
    if (timeSlotResult.valid) {
      clearFieldError('time-slots');
    } else {
      showFieldError('time-slots', timeSlotResult.message);
      isValid = false;
    }
  }

  // --- 5. Gender (radio group — no single input ID) ---
  const genderResult = validateGender();
  if (genderResult.valid) {
    clearFieldError('gender');
  } else {
    showFieldError('gender', genderResult.message);
    isValid = false;
  }

  // --- 6. Reason for Visit ---
  const reasonEl = document.getElementById('reason');
  const reasonResult = validateReason(reasonEl ? reasonEl.value : '');
  if (reasonResult.valid) {
    clearError('reason');
  } else {
    showError('reason', reasonResult.message);
    isValid = false;
  }

  // --- 7. Terms & Conditions checkbox ---
  const termsResult = validateTerms();
  if (termsResult.valid) {
    clearFieldError('terms');
  } else {
    showFieldError('terms', termsResult.message);
    isValid = false;
  }

  // Return the collective result of all validations
  return isValid;
}

/* ======= SUCCESS MESSAGE DISPLAY ======= */

const CONFIRMATION_STORAGE_KEY = 'healthconnectConfirmation';
const CONFIRMATION_FALLBACK_KEY = 'healthconnectLastConfirmation';

function formatDOBForDisplay(value) {
  if (!value) return '';

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function selectedOptionText(selectEl) {
  if (!selectEl || selectEl.selectedIndex < 0) return '';

  const option = selectEl.options[selectEl.selectedIndex];
  if (!option || option.value === '' || option.value === 'default') {
    return '';
  }

  return option.textContent.trim();
}

function buildConfirmationPayload() {
  const summaryValues = document.querySelectorAll('.summary-row-content span:last-child');

  const doctorNameEl = document.querySelector('.summary-doctor-name');
  const doctorSpecEl = document.querySelector('.summary-doctor-spec');
  const doctorRatingEl = document.querySelector('.summary-doctor .rating-number');
  const doctorAvatarEl = document.querySelector('.summary-doctor-img, .doctor-avatar-img');

  const dateSelect = document.getElementById('appt-date');
  const selectedDate = selectedOptionText(dateSelect) || (summaryValues[0] ? summaryValues[0].textContent.trim() : '');

  const selectedTimeRadio = document.querySelector('input[name="time-slot"]:checked');
  const selectedTime = selectedTimeRadio
    ? selectedTimeRadio.value.trim()
    : (summaryValues[1] ? summaryValues[1].textContent.trim() : '');

  const reasonEl = document.getElementById('reason');
  const reasonText = selectedOptionText(reasonEl);

  const locationText = summaryValues[2] ? summaryValues[2].textContent.trim() : '';
  const locationParts = locationText
    ? locationText.split(',').map(part => part.trim()).filter(Boolean)
    : [];

  let locationName = locationParts[0] || 'HealthConnect Partner Clinic';
  let locationLine2 = '';
  let locationLine3 = '';

  if (locationParts.length === 2) {
    locationLine3 = locationParts[1];
  } else if (locationParts.length > 2) {
    locationLine2 = locationParts.slice(1, -1).join(', ');
    locationLine3 = locationParts[locationParts.length - 1];
  }

  const randomSuffix = String(Math.floor(Math.random() * 90000) + 10000);

  return {
    confirmationNumber: 'APT-2026-' + randomSuffix,
    doctorName: doctorNameEl ? doctorNameEl.textContent.trim() : 'Selected Doctor',
    doctorSpecialty: doctorSpecEl ? doctorSpecEl.textContent.trim() : '',
    doctorRating: doctorRatingEl ? doctorRatingEl.textContent.trim() : '',
    doctorPhoto: doctorAvatarEl ? doctorAvatarEl.getAttribute('src') || '' : '',
    appointmentDate: selectedDate,
    appointmentTime: selectedTime,
    locationName: locationName,
    locationLine2: locationLine2,
    locationLine3: locationLine3,
    appointmentType: summaryValues[3] ? summaryValues[3].textContent.trim() : 'In Person Visit',
    patientName: (document.getElementById('full-name') || {}).value ? document.getElementById('full-name').value.trim() : 'Patient',
    patientEmail: (document.getElementById('email') || {}).value ? document.getElementById('email').value.trim() : '',
    patientPhone: (document.getElementById('phone') || {}).value ? document.getElementById('phone').value.trim() : '',
    patientDOB: formatDOBForDisplay((document.getElementById('dob') || {}).value || ''),
    reasonForVisit: reasonText || 'Not specified',
    createdAt: new Date().toISOString()
  };
}

function persistConfirmationPayload(payload) {
  try {
    sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Ignore session storage failures silently.
  }

  try {
    localStorage.setItem(CONFIRMATION_FALLBACK_KEY, JSON.stringify(payload));
  } catch (e) {
    // Ignore local storage failures silently.
  }
}

/**
 * Called when the form passes all validation checks.
 * Hides the form, builds a success confirmation panel in its place,
 * and scrolls the user to the top of the page.
 *
 * The success panel includes:
 * - A green checkmark icon
 * - A "Booking Submitted Successfully!" heading
 * - A personalised thank-you message using the patient's name and email
 * - A "View Confirmation" button linking to confirmation.html
 */
function showSuccessMessage() {
  const confirmationPayload = buildConfirmationPayload();
  persistConfirmationPayload(confirmationPayload);

  const patientName = confirmationPayload.patientName;
  const patientEmail = confirmationPayload.patientEmail;
  const doctorName = confirmationPayload.doctorName || 'your doctor';

  // Get the form element and its parent so we can insert the panel nearby
  const bookingForm = document.getElementById('booking-form');
  const formParent = bookingForm.parentNode;

  // Step 1: Hide the form — the success panel takes its visual place
  bookingForm.style.display = 'none';

  // Step 2: Build the success panel container
  const successDiv = document.createElement('div');
  successDiv.id = 'booking-success';
  successDiv.setAttribute('role', 'status');
  successDiv.setAttribute('aria-live', 'polite');

  // Apply layout styles directly so the component is self-contained
  successDiv.style.textAlign = 'center';
  successDiv.style.padding = '3rem 2rem';
  successDiv.style.background = '#f0fdf4';
  successDiv.style.border = '1px solid #bbf7d0';
  successDiv.style.borderRadius = '0.75rem';
  successDiv.style.marginTop = '1rem';

  // Assemble the inner content — icon, heading, message, CTA button
  successDiv.innerHTML =
    '<div style="width:72px;height:72px;background:#16a34a;border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;' +
    'color:white;font-size:2rem;margin:0 auto 1.5rem;" aria-hidden="true">&#10003;</div>' +
    '<h2 style="font-size:1.75rem;margin-bottom:0.75rem;">Booking Submitted Successfully!</h2>' +
    '<p style="color:#4a5568;max-width:480px;margin:0 auto 0.5rem;">' +
    'Thank you, <strong>' + patientName + '</strong>. Your appointment request with ' +
    '<strong>' + doctorName + '</strong> has been received. You will receive a confirmation email at ' +
    '<strong>' + patientEmail + '</strong> shortly.' +
    '</p>' +
    '<p style="color:#4a5568;max-width:480px;margin:0.5rem auto 2rem;">' +
    'Please save your confirmation number: <strong>' + confirmationPayload.confirmationNumber + '</strong>' +
    '</p>' +
    '<a href="confirmation.html" ' +
    'style="display:inline-block;background:#1a2e44;color:white;padding:0.875rem 2rem;' +
    'border-radius:0.4rem;font-weight:600;text-decoration:none;font-size:1rem;">' +
    'View Confirmation &rarr;' +
    '</a>';

  // Step 3: Insert the success panel where the form used to sit
  formParent.insertBefore(successDiv, bookingForm);

  // Step 4: Scroll smoothly to the top so the user sees the success message
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ======= FORM SUBMIT HANDLER ======== */

/**
 * Event handler attached to the booking form's submit event.
 * Prevents the default browser form submission, runs full validation,
 * then either shows the success message or scrolls to the first error.
 *
 * @param {Event} event - The native submit event object
 */
function handleFormSubmit(event) {
  // Step 1: Stop the browser from navigating away or refreshing the page
  event.preventDefault();

  // Step 2: Run the master validation across all mandatory fields
  const formIsValid = validateForm();

  if (formIsValid) {
    // Step 3: Every field passed — show the booking success panel
    showSuccessMessage();
  } else {
    // Step 4a: Find the first error message that is currently visible
    const firstError = document.querySelector('.error-message.visible');

    if (firstError) {
      // Smoothly scroll the first error into the visible viewport
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Step 4b: Focus the invalid input associated with this error
      // Walk up the tree to find the enclosing form group or fieldset
      const formGroup =
        firstError.closest('.form-group') ||
        firstError.closest('fieldset') ||
        firstError.parentElement;

      // Find the first focusable field inside that group and focus it
      const firstInvalidInput = formGroup
        ? formGroup.querySelector('input, select, textarea')
        : null;

      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
    }
  }
}

/* =============================================
   DOM READY — ATTACH ALL EVENT LISTENERS
   All listener attachment is wrapped inside
   DOMContentLoaded so the DOM is fully parsed
   before any getElementById calls are made.
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  // Guard: only run on the booking page — exit immediately on any other page
  const bookingForm = document.getElementById('booking-form');
  if (!bookingForm) return;

  // ---- Attach the main form submit handler ----
  bookingForm.addEventListener('submit', handleFormSubmit);

  // ---- Real-time validation: full-name ----
  // Validate on blur — fires when the user clicks or tabs away from the field
  const nameInput = document.getElementById('full-name');
  if (nameInput) {
    nameInput.addEventListener('blur', function () {
      const result = validateName(this.value);
      if (result.valid) {
        clearError('full-name');
      } else {
        showError('full-name', result.message);
      }
    });
  }

  // ---- Real-time validation: email ----
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function () {
      const result = validateEmail(this.value);
      if (result.valid) {
        clearError('email');
      } else {
        showError('email', result.message);
      }
    });
  }

  // ---- Real-time validation: phone ----
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', function () {
      const result = validatePhone(this.value);
      if (result.valid) {
        clearError('phone');
      } else {
        showError('phone', result.message);
      }
    });
  }

  // ---- Real-time validation: date of birth ----
  const dobInput = document.getElementById('dob');
  if (dobInput) {
    dobInput.addEventListener('blur', function () {
      const result = validateDOB(this.value);
      if (result.valid) {
        clearError('dob');
      } else {
        showError('dob', result.message);
      }
    });
  }

  // ---- Real-time validation: gender radio buttons ----
  // Attach a change listener to every radio in the gender group so that
  // selecting any option immediately clears the gender error
  const genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      const result = validateGender();
      if (result.valid) {
        clearFieldError('gender');
      } else {
        showFieldError('gender', result.message);
      }
    });
  });

  // ---- Real-time validation: reason for visit ----
  // Validate on change — fires each time the user picks a different option
  const reasonSelect = document.getElementById('reason');
  if (reasonSelect) {
    reasonSelect.addEventListener('change', function () {
      const result = validateReason(this.value);
      if (result.valid) {
        clearError('reason');
      } else {
        showError('reason', result.message);
      }
    });
  }

  // ---- Real-time validation: appointment date ----
  const apptDateSelect = document.getElementById('appt-date');
  if (apptDateSelect) {
    apptDateSelect.addEventListener('change', function () {
      const result = validateApptDate(this.value);
      if (result.valid) {
        clearError('appt-date');
      } else {
        showError('appt-date', result.message);
      }
    });
  }

  // ---- Real-time validation: terms & conditions checkbox ----
  // Validate on change — fires when the checkbox is ticked or unticked
  const termsCheckbox = document.getElementById('terms');
  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', function () {
      const result = validateTerms();
      if (result.valid) {
        clearFieldError('terms');
      } else {
        showFieldError('terms', result.message);
      }
    });
  }

});
