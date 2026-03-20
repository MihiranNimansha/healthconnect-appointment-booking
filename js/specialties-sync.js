/**
 * specialties-sync.js
 * Syncs specialty card availability badges with doctors loaded from XML.
 */

(function () {
  function toTitleCaseLabel(count) {
    return count === 1 ? '1 Doctor Available' : count + ' Doctors Available';
  }

  function readSpecialtyFromCard(card) {
    var titleEl = card.querySelector('.sp-card-title');
    return titleEl ? titleEl.textContent.trim() : '';
  }

  function countBySpecialty(doctorsList) {
    var counts = {};

    doctorsList.forEach(function (doctor) {
      var key = (doctor.specialty || '').trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
  }

  function syncSpecialtyBadges() {
    if (typeof doctors === 'undefined' || !Array.isArray(doctors) || doctors.length === 0) {
      return false;
    }

    var specialtyCounts = countBySpecialty(doctors);
    var cards = document.querySelectorAll('.sp-card');

    cards.forEach(function (card) {
      var specialty = readSpecialtyFromCard(card);
      if (!specialty) return;

      var badge = card.querySelector('.sp-badge');
      if (!badge) return;

      var count = specialtyCounts[specialty] || 0;

      if (count > 0) {
        badge.classList.remove('sp-badge--soon');
        badge.classList.add('sp-badge--available');
        badge.textContent = toTitleCaseLabel(count);
      } else {
        badge.classList.remove('sp-badge--available');
        badge.classList.add('sp-badge--soon');
        badge.textContent = 'Coming Soon';
      }
    });

    return true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var attempts = 0;
    var maxAttempts = 120; // ~6 seconds at 50ms

    var intervalId = setInterval(function () {
      attempts += 1;
      var synced = syncSpecialtyBadges();

      if (synced || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 50);
  });
})();
