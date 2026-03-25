/**
 * xml-loader.js
 * Loads and parses the doctors.xml data file using the browser's
 * built-in XMLHttpRequest API. Parsed doctor objects are stored in
 * the module-level `doctors` array and used by filter.js and timeslots.js.
 */

/* ========= MODULE STATE ========== */

/** Stores all parsed doctor objects after the XML file is loaded. */
let doctors = [];

/* ========= XML LOADING AND PARSING ========= */

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

  // Use asynchronous GET; fallback to DOMParser if responseXML is empty.
  xhr.open('GET', xmlFilePath, true);
  xhr.responseType = 'document';

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      let xmlDoc = xhr.responseXML;

      if (!xmlDoc && xhr.responseText) {
        try {
          xmlDoc = new DOMParser().parseFromString(xhr.responseText, 'application/xml');
          if (xmlDoc.querySelector('parsererror')) {
            xmlDoc = null;
          }
        } catch (e) {
          xmlDoc = null;
        }
      }

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
 * Generates a five-character star string from a numeric rating.
 * Filled stars up to the rounded value, empty stars for the rest.
 *
 * @param {string|number} rating - Numeric rating e.g. "4.8"
 * @returns {string} Star string e.g. "★★★★☆"
 */
function buildStars(rating) {
  const filled = Math.round(parseFloat(rating));
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < filled ? '\u2605' : '\u2606';
  }
  return stars;
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
  const acceptingPatients = getElText(doctorNode, 'acceptingPatients').toLowerCase() === 'true';
  const phone = getElText(doctorNode, 'phone');
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
    acceptingPatients,
    phone,
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
  const stars = buildStars(doctor.rating);

  // Encode the id in the profile URL to prevent URL injection
  const profileUrl = 'profile.html?doctor=' + encodeURIComponent(doctor.id);

  const isFav = typeof Auth !== 'undefined' && Auth.isFavorite(doctor.id);
  const avatarUrl = 'images/doctor_' + doctor.id + '.png';
  const fallbackUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=random&color=fff&size=128&rounded=true&font-size=0.35&bold=true';
  const fee = doctor.consultationFee ? doctor.consultationFee.toLocaleString() : 'N/A';

  const favBtnHtml = '<button class="favorite-btn ' + (isFav ? 'active' : '') + '" aria-label="Toggle favorite for ' + doctor.name + '" onclick="event.stopPropagation(); event.preventDefault(); if(typeof Auth !== \'undefined\') { Auth.toggleFavorite(\'' + doctor.id + '\'); this.classList.toggle(\'active\'); }"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>';

  return (
    '<article class="card result-card" aria-label="' + doctor.name + '">' +
      favBtnHtml +
      '<div class="result-card-header">' +
        '<img src="' + avatarUrl + '" onerror="if(this.src !== \'' + fallbackUrl + '\') this.src=\'' + fallbackUrl + '\';" alt="Profile photo of ' + doctor.name + '" class="result-card-photo" width="84" height="84" loading="lazy">' +
        '<div class="doctor-info">' +
          '<h3 class="doctor-name">' + doctor.name + '</h3>' +
          '<p class="doctor-specialty">' + doctor.specialty + '</p>' +
          '<span class="badge ' + (doctor.acceptingPatients ? 'badge-success' : 'badge-closed') + '" aria-label="' + (doctor.acceptingPatients ? 'Accepting Patients' : 'Not Accepting') + '">' + (doctor.acceptingPatients ? 'Accepting Patients' : 'Not Accepting') + '</span>' +
          '<div class="rating" aria-label="Rating: ' + doctor.rating + ' out of 5 stars">' +
            '<span class="stars" aria-hidden="true">' + stars + '</span>' +
            '<span class="rating-score">' + doctor.rating + '</span>' +
            '<span class="rating-count">(' + doctor.reviewCount + ')</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="doctor-meta">' +
        '<div class="doctor-meta-item"><span aria-hidden="true">&#x25CF;</span><span>' + doctor.experience + '</span></div>' +
        '<div class="doctor-meta-item"><span aria-hidden="true">&#x25CF;</span><span>' + doctor.hospital + '</span></div>' +
      '</div>' +
      '<div class="doctor-price" aria-label="Consultation fee: LKR ' + fee + '">' +
        '<span class="price-label">Consultation Fee</span>' +
        '<span class="price-value">LKR ' + fee + '</span>' +
      '</div>' +
      '<a href="' + profileUrl + '" class="btn btn-primary btn-card" aria-label="View available slots for ' + doctor.name + '">View Available Slots</a>' +
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
   INITIALIZATION
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
  // Attempt to load XML data; filter.js will render cards via its own callback
  loadDoctorsFromXML('xml/doctors.xml', function (parsed) {
    // Make the parsed array available globally for filter.js / timeslots.js
    doctors = parsed;
  });
});
