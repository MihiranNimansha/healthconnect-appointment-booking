/**
 * contact-validation.js
 * HealthConnect — CM1605 Web Technology Coursework
 *
 * Handles client-side form validation for the contact form
 * (contact.html). Uses pure JavaScript — no HTML5 validation.
 * Mandatory fields: Name, Email, Subject, Message.
 *
 */

/* =============================================
   VALIDATION FUNCTIONS
   ============================================= */

/**
 * Validates a non-empty text value.
 * @param {string} value
 * @param {string} fieldLabel
 * @returns {{ valid: boolean, message: string }}
 */
function validateContactRequired(value, fieldLabel) {
    if (!value || value.trim().length === 0) {
        return { valid: false, message: fieldLabel + ' is required.' };
    }
    if (value.trim().length < 2) {
        return { valid: false, message: fieldLabel + ' must be at least 2 characters.' };
    }
    return { valid: true, message: '' };
}

/**
 * Validates an email address.
 * @param {string} value
 * @returns {{ valid: boolean, message: string }}
 */
function validateContactEmail(value) {
    var trimmed = value.trim();
    if (trimmed.length === 0) {
        return { valid: false, message: 'Email address is required.' };
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        return { valid: false, message: 'Please enter a valid email address.' };
    }
    return { valid: true, message: '' };
}

/**
 * Validates a select dropdown (must not be "default" placeholder).
 * @param {string} value
 * @returns {{ valid: boolean, message: string }}
 */
function validateContactSubject(value) {
    if (!value || value === '' || value === 'default') {
        return { valid: false, message: 'Please select a subject.' };
    }
    return { valid: true, message: '' };
}

/* =============================================
   UI HELPERS
   ============================================= */

function showContactError(fieldId, message) {
    var inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.classList.add('input-error');
    inputEl.classList.remove('success');
    inputEl.setAttribute('aria-invalid', 'true');
    var errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

function clearContactError(fieldId) {
    var inputEl = document.getElementById(fieldId);
    if (!inputEl) return;
    inputEl.classList.remove('input-error');
    inputEl.classList.add('success');
    inputEl.setAttribute('aria-invalid', 'false');
    var errorEl = document.getElementById(fieldId + '-error');
    if (errorEl) {
        errorEl.classList.remove('visible');
        errorEl.textContent = '';
    }
}

/* =============================================
   MASTER VALIDATION
   ============================================= */

function validateContactForm() {
    var isValid = true;

    // Name
    var nameEl = document.getElementById('contact-name');
    var nameResult = validateContactRequired(nameEl ? nameEl.value : '', 'Full name');
    if (nameResult.valid) { clearContactError('contact-name'); }
    else { showContactError('contact-name', nameResult.message); isValid = false; }

    // Email
    var emailEl = document.getElementById('contact-email');
    var emailResult = validateContactEmail(emailEl ? emailEl.value : '');
    if (emailResult.valid) { clearContactError('contact-email'); }
    else { showContactError('contact-email', emailResult.message); isValid = false; }

    // Subject
    var subjectEl = document.getElementById('contact-subject');
    var subjectResult = validateContactSubject(subjectEl ? subjectEl.value : '');
    if (subjectResult.valid) { clearContactError('contact-subject'); }
    else { showContactError('contact-subject', subjectResult.message); isValid = false; }

    // Message
    var messageEl = document.getElementById('contact-message');
    var messageResult = validateContactRequired(messageEl ? messageEl.value : '', 'Message');
    if (messageResult.valid) { clearContactError('contact-message'); }
    else { showContactError('contact-message', messageResult.message); isValid = false; }

    return isValid;
}

/* =============================================
   SUCCESS MESSAGE
   ============================================= */

function showContactSuccess() {
    var form = document.getElementById('contact-form');
    var parent = form.parentNode;
    form.style.display = 'none';

    var successDiv = document.createElement('div');
    successDiv.id = 'contact-success';
    successDiv.setAttribute('role', 'status');
    successDiv.setAttribute('aria-live', 'polite');
    successDiv.style.textAlign = 'center';
    successDiv.style.padding = '3rem 2rem';
    successDiv.style.background = '#f0fdf4';
    successDiv.style.border = '1px solid #bbf7d0';
    successDiv.style.borderRadius = '0.75rem';
    successDiv.style.marginTop = '1rem';

    successDiv.innerHTML =
        '<div style="width:72px;height:72px;background:#16a34a;border-radius:50%;' +
        'display:flex;align-items:center;justify-content:center;' +
        'color:white;font-size:2rem;margin:0 auto 1.5rem;" aria-hidden="true">&#10003;</div>' +
        '<h2 style="font-size:1.75rem;margin-bottom:0.75rem;">Message Sent Successfully!</h2>' +
        '<p style="color:#4a5568;max-width:480px;margin:0 auto 2rem;">' +
        'Thank you for reaching out. Our team will review your message and get back to you within 24 hours.' +
        '</p>' +
        '<a href="index.html" ' +
        'style="display:inline-block;background:#1a2e44;color:white;padding:0.875rem 2rem;' +
        'border-radius:0.4rem;font-weight:600;text-decoration:none;font-size:1rem;">' +
        'Back to Home &rarr;</a>';

    parent.insertBefore(successDiv, form);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =============================================
   EVENT LISTENERS
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
    var contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var formIsValid = validateContactForm();
        if (formIsValid) {
            showContactSuccess();
        } else {
            var firstError = document.querySelector('#contact-form .error-message.visible');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var group = firstError.closest('.form-group');
                var input = group ? group.querySelector('input, select, textarea') : null;
                if (input) input.focus();
            }
        }
    });

    // Real-time blur/change validation
    var nameInput = document.getElementById('contact-name');
    if (nameInput) {
        nameInput.addEventListener('blur', function () {
            var r = validateContactRequired(this.value, 'Full name');
            r.valid ? clearContactError('contact-name') : showContactError('contact-name', r.message);
        });
    }

    var emailInput = document.getElementById('contact-email');
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            var r = validateContactEmail(this.value);
            r.valid ? clearContactError('contact-email') : showContactError('contact-email', r.message);
        });
    }

    var subjectSelect = document.getElementById('contact-subject');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', function () {
            var r = validateContactSubject(this.value);
            r.valid ? clearContactError('contact-subject') : showContactError('contact-subject', r.message);
        });
    }

    var messageInput = document.getElementById('contact-message');
    if (messageInput) {
        messageInput.addEventListener('blur', function () {
            var r = validateContactRequired(this.value, 'Message');
            r.valid ? clearContactError('contact-message') : showContactError('contact-message', r.message);
        });
    }
});
