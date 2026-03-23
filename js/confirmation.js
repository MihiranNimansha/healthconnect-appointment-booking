/*confirmation.js
 * Syncs confirmation page fields from the latest booking payload.
 */

(function () {
  const SESSION_KEY = 'healthconnectConfirmation';
  const FALLBACK_KEY = 'healthconnectLastConfirmation';

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null || value === '') return;
    el.textContent = value;
  }

  function setOptionalLine(id, value) {
    const el = document.getElementById(id);
    if (!el) return;

    if (value && String(value).trim().length > 0) {
      el.textContent = value;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  }

  function updateDoctorPhoto(photoPath) {
    const photo = document.querySelector('.confirm-photo');
    if (!photo || !photoPath) return;

    const safePath = String(photoPath).replace(/"/g, '');
    photo.style.backgroundImage = 'url("' + safePath + '")';
    photo.style.backgroundSize = 'cover';
    photo.style.backgroundPosition = 'center';
    photo.style.backgroundRepeat = 'no-repeat';
  }

  function normalizeConfirmationNumber(value) {
    if (!value || typeof value !== 'string') {
      return 'APT-2026-15783';
    }

    return value.replace(/^APT-\d{4}-/, 'APT-2026-');
  }

  function readStoredPayload() {
    const keys = [SESSION_KEY, FALLBACK_KEY];

    for (let i = 0; i < keys.length; i++) {
      try {
        const raw = (keys[i] === SESSION_KEY ? sessionStorage : localStorage).getItem(keys[i]);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (e) {
        // Ignore malformed JSON and storage access errors.
      }
    }

    return null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const addToCalendarBtn = document.getElementById('add-to-calendar-btn');
    if (addToCalendarBtn) {
      addToCalendarBtn.addEventListener('click', function () {
        alert('Appointment Added to calender');
      });
    }

    const payload = readStoredPayload();

    if (!payload) {
      setText('confirmation-number-text', 'APT-2026-15783');
      return;
    }

    setText('confirmation-number-text', normalizeConfirmationNumber(payload.confirmationNumber));
    setText('confirm-doctor-name', payload.doctorName);
    setText('confirm-doctor-specialty', payload.doctorSpecialty);
    setText('confirm-doctor-rating', payload.doctorRating);

    setText('confirm-date', payload.appointmentDate);
    setText('confirm-time', payload.appointmentTime);

    setText('confirm-location-name', payload.locationName);
    setOptionalLine('confirm-location-line2', payload.locationLine2);
    setOptionalLine('confirm-location-line3', payload.locationLine3);

    setText('confirm-appointment-type', payload.appointmentType);

    setText('confirm-patient-name', payload.patientName);
    setText('confirm-patient-email', payload.patientEmail);
    setText('confirm-patient-phone', payload.patientPhone);
    setText('confirm-patient-dob', payload.patientDOB);
    setText('confirm-patient-reason', payload.reasonForVisit);

    updateDoctorPhoto(payload.doctorPhoto);
  });
})();
