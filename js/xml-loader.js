/**
 * xml-loader.js
 * HealthConnect — CM1605 Web Technology Coursework
 *
 * Loads and parses the doctors.xml data file using the browser's
 * built-in XMLHttpRequest API. Parsed doctor objects are stored in
 * the module-level `doctors` array and used by filter.js and timeslots.js.
 * No external libraries are used.
 *
 * Author: [Your Name]
 * Date: March 2026
 */

/* =============================================
   MODULE STATE
   ============================================= */

/** Stores all parsed doctor objects after the XML file is loaded. */
let doctors = [];

/* =============================================
   XML LOADING AND PARSING
   ============================================= */

/**
 * Loads doctor data from the XML file using XMLHttpRequest.
 * Uses responseType "document" so the browser returns a parsed XML DOM.
 * On success, calls parseDoctor() on every <doctor> element and invokes
 * callback with the resulting array.
 * On error, logs a message and calls callback with an empty array.
 *
 * @param {string}   xmlFilePath - Relative path to the XML file e.g. "xml/doctors.xml"
 * @param {function} callback   - Called with the parsed doctors array when done
 */
function loadDoctorsFromXML(xmlFilePath, callback) {
  const xhr = new XMLHttpRequest();

  // Use asynchronous GET; responseType "document" returns a parsed XML DOM
  xhr.open('GET', xmlFilePath, true);
  xhr.responseType = 'document';

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      const xmlDoc = xhr.responseXML;
      if (!xmlDoc) {
        console.error('HealthConnect xml-loader: received empty or non-XML response from', xmlFilePath);
        callback([]);
        return;
      }

      // Parse every <doctor> node into a plain JS object
      const doctorNodes = Array.from(xmlDoc.querySelectorAll('doctor'));
      const parsed = doctorNodes.map(function (node) {
        return parseDoctor(node);
      });

      // Store in module-level array for use by filter.js / timeslots.js
      doctors = parsed;
      callback(parsed);
    } else {
      console.error('HealthConnect xml-loader: failed to load', xmlFilePath, '— HTTP', xhr.status);
      callback([]);
    }
  };

  xhr.onerror = function () {
    console.error('HealthConnect xml-loader: network error while loading', xmlFilePath);
    callback([]);
  };

  xhr.send();
}

/**
 * Helper that safely reads the text content of the first matching
 * child element within a given parent node.
 *
 * @param {Element} parent - Parent XML element to search within
 * @param {string}  tag    - Tag name to query
 * @returns {string} Trimmed text content, or empty string if not found
 */
function getElText(parent, tag) {
  const el = parent.querySelector(tag);
  return el ? el.textContent.trim() : '';
}

/**
 * Helper that collects the text content of all matching child elements
 * within a given parent node into a plain array.
 *
 * @param {Element} parent - Parent XML element to search within
 * @param {string}  tag    - Tag name to query
 * @returns {Array<string>} Array of trimmed text strings
 */
function getElArray(parent, tag) {
  return Array.from(parent.querySelectorAll(tag)).map(function (el) {
    return el.textContent.trim();
  });
}

/**
 * Parses a single <doctor> XML element into a plain JavaScript object.
 * Extracts scalar fields, arrays (languages, certifications, specializations),
 * and the nested schedule (days with time slots).
 *
 * @param {Element} doctorNode - A <doctor> DOM element from the parsed XML
 * @returns {object} A doctor data object matching the XML schema
 */
function parseDoctor(doctorNode) {
  // Scalar text fields
  const id = doctorNode.getAttribute('id') || '';
  const name = getElText(doctorNode, 'name');
  const specialty = getElText(doctorNode, 'specialty');
  const experience = getElText(doctorNode, 'experience');
  const hospital = getElText(doctorNode, 'hospital');
  const location = getElText(doctorNode, 'location');
  const city = getElText(doctorNode, 'city');
  const distance = getElText(doctorNode, 'distance');
  const rating = getElText(doctorNode, 'rating');
  const reviewCount = getElText(doctorNode, 'reviewCount');
  const about = getElText(doctorNode, 'about');
  const education = getElText(doctorNode, 'education');
  const residency = getElText(doctorNode, 'residency');
  const fellowship = getElText(doctorNode, 'fellowship');
  const consultationFee = parseInt(getElText(doctorNode, 'consultationFee'), 10) || 0;

  // Array fields: each item is a child element with its own tag name
  const languages = getElArray(doctorNode, 'language');
  const boardCerts = getElArray(doctorNode, 'certification');
  const specializations = getElArray(doctorNode, 'specialization');

  // Nested schedule: build an object keyed by day name
  const schedule = {};
  const dayNodes = Array.from(doctorNode.querySelectorAll('day'));
  dayNodes.forEach(function (dayNode) {
    const dayName = dayNode.getAttribute('name');
    // Each <slot> has time, period, and available attributes
    const slots = Array.from(dayNode.querySelectorAll('slot')).map(function (slot) {
      return {
        time: slot.getAttribute('time') || '',
        period: slot.getAttribute('period') || '',
        available: slot.getAttribute('available') === 'true'
      };
    });
    schedule[dayName] = slots;
  });

  return {
    id,
    name,
    specialty,
    experience,
    hospital,
    location,
    city,
    distance,
    rating,
    reviewCount,
    about,
    education,
    residency,
    fellowship,
    consultationFee,
    languages,
    boardCerts,
    specializations,
    schedule
  };
}

/**
 * Builds an HTML string for one doctor result card.
 * Card markup matches the .result-card structure used in search.html.
 * Profile links include the doctor's id as a query parameter.
 *
 * @param {object} doctor - Doctor object returned by parseDoctor()
 * @returns {string} HTML string for one result card
 */
function renderDoctorCard(doctor) {
  // Build star display: filled (★) and empty (☆) characters
  const filled = Math.round(parseFloat(doctor.rating));
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < filled ? '\u2605' : '\u2606';
  }

  // Encode the id in the profile URL to prevent URL injection
  const profileUrl = 'profile.html?doctor=' + encodeURIComponent(doctor.id);

  const isFav = typeof Auth !== 'undefined' && Auth.isFavorite(doctor.id);
  const favBtnHtml = '<button class="favorite-btn ' + (isFav ? 'active' : '') + '" aria-label="Toggle favorite for ' + doctor.name + '" onclick="event.stopPropagation(); event.preventDefault(); if(typeof Auth !== \'undefined\') { const s = Auth.toggleFavorite(\'' + doctor.id + '\'); if(s) { const c = Auth.isFavorite(\'' + doctor.id + '\'); this.classList.toggle(\'active\', c); this.querySelector(\'svg\').setAttribute(\'fill\', c ? \'#e11d48\' : \'none\'); } }" style="position:absolute; top:12px; right:12px; background:white; border:none; border-radius:50%; padding:6px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:10;"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="' + (isFav ? '#e11d48' : 'none') + '" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>';

  return (
    '<article class="card result-card" aria-label="' + doctor.name + '" style="position:relative;">' +
    favBtnHtml +
    '<div class="result-card-header">' +
    '<div class="photo-placeholder result-card-photo" role="img" ' +
    'aria-label="Photo placeholder for ' + doctor.name + '"></div>' +
    '<div class="result-card-info">' +
    '<h3>' + doctor.name + '</h3>' +
    '<p class="doctor-specialty">' + doctor.specialty + '</p>' +
    '<div class="star-rating" aria-label="Rating: ' + doctor.rating + ' out of 5 stars">' +
    '<span aria-hidden="true">' + stars + '</span>' +
    '<span class="rating-number">' + doctor.rating + '</span>' +
    '<span class="rating-count">(' + doctor.reviewCount + ')</span>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="result-card-details">' +
    '<div class="detail-row"><span class="detail-dot" aria-hidden="true"></span><span>' + doctor.experience + '</span></div>' +
    '<div class="detail-row"><span class="detail-dot" aria-hidden="true"></span><span>' + doctor.hospital + '</span></div>' +
    '<div class="detail-row"><span class="detail-dot" aria-hidden="true"></span><span>' + doctor.distance + '</span></div>' +
    '</div>' +
    '<a href="' + profileUrl + '" class="btn-primary btn-card">View Available Slots</a>' +
    '</article>'
  );
}

/**
 * Searches the module-level doctors array for a doctor whose id matches.
 * Returns the first matching doctor object, or null if not found.
 *
 * @param {string} id - Doctor id to search for e.g. "001"
 * @returns {object|null} The matching doctor object, or null
 */
function getDoctorById(id) {
  for (let i = 0; i < doctors.length; i++) {
    if (doctors[i].id === id) {
      return doctors[i];
    }
  }
  return null;
}

/* =============================================
   INITIALISATION
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
  // Attempt to load XML data; filter.js will render cards via its own callback
  loadDoctorsFromXML('xml/doctors.xml', function (parsed) {
    // Make the parsed array available globally for filter.js / timeslots.js
    doctors = parsed;
  });
});
