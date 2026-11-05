/*filter.js
 * Handles dynamic filtering of doctor cards on search.html.
 * Filters doctors by specialty and city from the doctorsData array.
 */

/* ======= PAGINATION STATE ======= */
let currentPage = 1;
const ITEMS_PER_PAGE = 9;

/* ======= DATA SOURCE ======= */
/*Doctors loaded from xml/doctors.xml via xml-loader.js.*/

let doctorsData = [];

/* ======== FILTER FUNCTIONS ========*/

/**
 * Filters the doctorsData array by specialty and city.
 * Applies specialty filter first, then city filter if specified.
 * "all" or empty string values are treated as no filter.
 * Comparison is case-insensitive and handles hyphenated values.
 *
 * @param {string} specialty - The specialty to filter by, or "all"
 * @param {string} city      - The city to filter by, or "all"
 * @returns {Array} Filtered array of doctor objects
 */
function filterDoctors(specialty, city, availability, priceRange) {
  let result = doctorsData.slice();

  if (specialty && specialty !== 'all' && specialty !== '') {
    const normalised = specialty.toLowerCase().replace(/-/g, ' ');
    result = result.filter(function (doctor) {
      return doctor.specialty.toLowerCase() === normalised;
    });
  }
  if (city && city !== 'all' && city !== '') {
    result = result.filter(function (doctor) {
      return doctor.city === city;
    });
  }
  if (availability && availability !== 'all' && availability !== '') {
    const isAccepting = availability === 'accepting';
    result = result.filter(function (doctor) {
      return doctor.acceptingPatients === isAccepting;
    });
  }
  if (priceRange && priceRange !== 'all' && priceRange !== '') {
    result = result.filter(function (doctor) {
      var fee = doctor.consultationFee || 0;
      if (priceRange === 'under-2000') return fee < 2000;
      if (priceRange === '2000-3000') return fee >= 2000 && fee <= 3000;
      if (priceRange === '3000-5000') return fee > 3000 && fee <= 5000;
      if (priceRange === 'above-5000') return fee > 5000;
      return true;
    });
  }

  return result;
}

/**
 Sorts a copy of the doctors array by the specified criteria.
 *
 * @param {Array}  arr     - Array of doctor objects
 * @param {string} sortBy  - Sort key: "best-match" | "rating" | "experience" | "price-asc" | "price-desc"
 * @returns {Array} New sorted array (original is not mutated)
 */
function sortDoctors(arr, sortBy) {
  var copy = arr.slice();
  if (sortBy === 'rating') {
    copy.sort(function (a, b) { return parseFloat(b.rating) - parseFloat(a.rating); });
  } else if (sortBy === 'experience') {
    copy.sort(function (a, b) {
      return parseInt(b.experience, 10) - parseInt(a.experience, 10);
    });
  } else if (sortBy === 'price-asc') {
    copy.sort(function (a, b) { return (a.consultationFee || 0) - (b.consultationFee || 0); });
  } else if (sortBy === 'price-desc') {
    copy.sort(function (a, b) { return (b.consultationFee || 0) - (a.consultationFee || 0); });
  }
  // "best-match" keeps original order
  return copy;
}

/**
 * Renders an array of doctor objects as HTML cards into #doctors-grid.
 * Clears existing grid content first.
 * Shows a "No doctors found" message when the array is empty.
 * Doctor avatars are fetched from ui-avatars.com using the doctor name.
 *
 * @param {Array} doctorsArray - Array of doctor objects to render
 */
function renderDoctorCards(doctorsArray) {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (doctorsArray.length === 0) {
    const noResults = document.createElement('p');
    noResults.className = 'no-results-message';
    noResults.textContent = 'No doctors found for this filter. Please try a different selection.';
    grid.appendChild(noResults);
    // Hide pagination
    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  // --- PAGINATION SLICE ---
  const totalPages = Math.ceil(doctorsArray.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = doctorsArray.slice(startIndex, endIndex);

  pageItems.forEach(function (doctor) {
    const stars = buildStars(doctor.rating);

    const card = document.createElement('article');
    card.className = 'card result-card';
    card.setAttribute('aria-label', doctor.name);

    // ---- Header row: avatar + info block ----
    const header = document.createElement('div');
    header.className = 'result-card-header';

    // Generate avatar image with fallback to ui-avatars.com 
    const avatarUrl = 'images/doctor_' + doctor.id + '.png';
    const fallbackUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=random&color=fff&size=128&rounded=true&font-size=0.35&bold=true';

    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.onerror = function () {
      if (this.src === fallbackUrl) return; // Prevent infinite loop
      this.src = fallbackUrl;
    };
    avatar.alt = 'Profile photo of ' + doctor.name;
    avatar.className = 'result-card-photo';
    avatar.width = 84;
    avatar.height = 84;
    avatar.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'doctor-info';

    const nameEl = document.createElement('h3');
    nameEl.className = 'doctor-name';
    nameEl.textContent = doctor.name;

    const specialtyEl = document.createElement('p');
    specialtyEl.className = 'doctor-specialty';
    specialtyEl.textContent = doctor.specialty;

    // Star rating row
    const ratingEl = document.createElement('div');
    ratingEl.className = 'rating';
    ratingEl.setAttribute('aria-label', 'Rating: ' + doctor.rating + ' out of 5 stars');

    const starsEl = document.createElement('span');
    starsEl.className = 'stars';
    starsEl.setAttribute('aria-hidden', 'true');
    starsEl.textContent = stars;

    const scoreEl = document.createElement('span');
    scoreEl.className = 'rating-score';
    scoreEl.textContent = doctor.rating;

    const countEl = document.createElement('span');
    countEl.className = 'rating-count';
    countEl.textContent = '(' + doctor.reviewCount + ')';

    ratingEl.appendChild(starsEl);
    ratingEl.appendChild(scoreEl);
    ratingEl.appendChild(countEl);

    // ---- Accepting-patients badge ----
    const badge = document.createElement('span');
    badge.className = 'badge ' + (doctor.acceptingPatients ? 'badge-success' : 'badge-closed');
    badge.setAttribute('aria-label',
      doctor.acceptingPatients
        ? 'Accepting new patients'
        : 'Not currently accepting new patients');
    badge.textContent = doctor.acceptingPatients ? 'Accepting Patients' : 'Not Accepting';

    info.appendChild(nameEl);
    info.appendChild(specialtyEl);
    info.appendChild(badge);
    info.appendChild(ratingEl);

    header.appendChild(avatar);
    header.appendChild(info);

    // ---- Meta details: experience, hospital ----
    const meta = document.createElement('div');
    meta.className = 'doctor-meta';

    [doctor.experience, doctor.hospital].forEach(function (text) {
      const item = document.createElement('div');
      item.className = 'doctor-meta-item';

      const bullet = document.createElement('span');
      bullet.setAttribute('aria-hidden', 'true');
      bullet.textContent = '\u25CF'; // 

      const label = document.createElement('span');
      label.textContent = text;

      item.appendChild(bullet);
      item.appendChild(label);
      meta.appendChild(item);
    });

    // ---- Consultation Fee ----
    const priceEl = document.createElement('div');
    priceEl.className = 'doctor-price';
    priceEl.setAttribute('aria-label', 'Consultation fee: LKR ' + (doctor.consultationFee || 0).toLocaleString());

    const priceLabel = document.createElement('span');
    priceLabel.className = 'price-label';
    priceLabel.textContent = 'Consultation Fee';

    const priceValue = document.createElement('span');
    priceValue.className = 'price-value';
    priceValue.textContent = 'LKR ' + (doctor.consultationFee ? doctor.consultationFee.toLocaleString() : 'N/A');

    priceEl.appendChild(priceLabel);
    priceEl.appendChild(priceValue);

    // ---- CTA button: links to profile page for this specific doctor ----
    const btn = document.createElement('a');
    btn.href = 'profile.html?doctor=' + encodeURIComponent(doctor.id);
    btn.className = 'btn btn-primary btn-card';
    btn.setAttribute('aria-label', 'View available slots for ' + doctor.name);
    btn.textContent = 'View Available Slots';

    // ---- Favorite Button ----
    const favBtn = document.createElement('button');
    const isFav = typeof Auth !== 'undefined' && Auth.isFavorite(doctor.id);
    favBtn.className = 'favorite-btn ' + (isFav ? 'active' : '');
    favBtn.setAttribute('aria-label', 'Toggle favorite for ' + doctor.name);
    // Using a standard crisp line-art heart
    favBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    favBtn.onclick = function (e) {
      e.stopPropagation();
      e.preventDefault();
      if (typeof Auth !== 'undefined') {
        const success = Auth.toggleFavorite(doctor.id);
        if (success) {
          const currentlyFav = Auth.isFavorite(doctor.id);
          this.classList.toggle('active', currentlyFav);
          this.querySelector('svg').setAttribute('fill', currentlyFav ? '#e11d48' : 'none');
        }
      }
    };

    card.style.position = 'relative'; // Ensure top right positioning works
    card.appendChild(favBtn);
    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(priceEl);
    card.appendChild(btn);

    grid.appendChild(card);
  });

  // --- RENDER PAGINATION UI ---
  renderPaginationUI(doctorsArray, totalPages);
}

/**
 * Generates and updates the pagination buttons container.
 *
 * @param {Array} doctorsArray - The current filtered array to pass onto clicks
 * @param {number} totalPages  - Total calculated pages
 */
function renderPaginationUI(doctorsArray, totalPages) {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;

  paginationContainer.innerHTML = '';

  if (totalPages <= 1) {
    paginationContainer.style.display = 'none';
    return;
  }

  paginationContainer.style.display = 'flex';

  // Previous button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.type = 'button';
  prevBtn.textContent = 'Previous';
  prevBtn.setAttribute('aria-label', 'Previous page');
  if (currentPage === 1) prevBtn.disabled = true;
  prevBtn.addEventListener('click', function () {
    if (currentPage > 1) {
      currentPage--;
      renderDoctorCards(doctorsArray);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
    pageBtn.type = 'button';
    pageBtn.textContent = i;
    pageBtn.setAttribute('aria-label', 'Page ' + i);
    if (i === currentPage) pageBtn.setAttribute('aria-current', 'page');

    pageBtn.addEventListener('click', function () {
      if (currentPage !== i) {
        currentPage = i;
        renderDoctorCards(doctorsArray);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.type = 'button';
  nextBtn.textContent = 'Next';
  nextBtn.setAttribute('aria-label', 'Next page');
  if (currentPage === totalPages) nextBtn.disabled = true;
  nextBtn.addEventListener('click', function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderDoctorCards(doctorsArray);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(nextBtn);
}

/**
 * Updates the results count text and the main heading on search.html.
 *
 * @param {number} count     - Number of results being shown
 * @param {string} specialty - Current filter specialty or "all"
 */
function updateResultsCount(count, specialty) {
  const countEl = document.querySelector('.results-count');
  if (countEl) {
    countEl.textContent = 'Showing ' + count + ' result' + (count !== 1 ? 's' : '');
  }

  const heading = document.getElementById('results-heading');
  if (heading) {
    if (!specialty || specialty === 'all' || specialty === '') {
      heading.textContent = 'Doctors in Sri Lanka';
    } else {
      const display = specialty
        .split('-')
        .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
        .join(' ');
      const plural = display.endsWith('s') ? display : display + 's';
      heading.textContent = plural + ' in Sri Lanka';
    }
  }
}

/**
 * Updates the active filter tags display.
 *
 * @param {string} specialty - Currently active specialty filter
 */
function updateActiveFilters(specialty) {
  const tagsContainer = document.querySelector('.filter-tags');
  if (!tagsContainer) return;

  const existing = tagsContainer.querySelector('.filter-tag[data-dynamic]');
  if (existing) {
    existing.remove();
  }

  if (!specialty || specialty === 'all' || specialty === '') {
    return;
  }

  const display = specialty
    .split('-')
    .map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); })
    .join(' ');

  const tag = document.createElement('span');
  tag.className = 'filter-tag';
  tag.setAttribute('role', 'listitem');
  tag.setAttribute('data-dynamic', 'true');

  tag.appendChild(document.createTextNode(display + ' '));

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'tag-dismiss';
  dismissBtn.setAttribute('aria-label', 'Remove ' + display + ' filter');
  dismissBtn.textContent = '\u00D7'; // 
  dismissBtn.addEventListener('click', function () {
    clearFilter();
  });

  tag.appendChild(dismissBtn);

  const clearBtn = tagsContainer.querySelector('.clear-filters');
  if (clearBtn) {
    tagsContainer.insertBefore(tag, clearBtn);
  } else {
    tagsContainer.appendChild(tag);
  }
}

/**
 * Clears all active filters and shows all doctors.
 * Resets both specialty and city selects to "all".
 */
function clearFilter() {
  const filterSelect = document.getElementById('search-specialty');
  if (filterSelect) {
    filterSelect.value = 'all';
  }

  const cityEl = document.getElementById('city-filter');
  if (cityEl) {
    cityEl.value = 'all';
  }

  const availEl = document.getElementById('availability-filter');
  if (availEl) {
    availEl.value = 'all';
  }

  const priceEl = document.getElementById('price-filter');
  if (priceEl) {
    priceEl.value = 'all';
  }

  const all = filterDoctors('all', 'all', 'all', 'all');
  currentPage = 1;
  renderDoctorCards(all);
  updateResultsCount(all.length, 'all');
  updateActiveFilters('all');
}

/**
 * Initializes all filter event listeners on search.html.
 * Updates specialty options to all 8 Sri Lankan specialties.
 * Supports deep-linking via ?specialty= URL parameter.
 */
function initFilters() {
  const filterSelect = document.getElementById('search-specialty');

  // Update specialty options to all 8 specialties
  if (filterSelect) {
    filterSelect.innerHTML =
      '<option value="all">All Specialties</option>' +
      '<option value="Cardiology">Cardiology</option>' +
      '<option value="General Practice">General Practice</option>' +
      '<option value="Pediatrics">Pediatrics</option>' +
      '<option value="Dermatology">Dermatology</option>' +
      '<option value="Orthopedics">Orthopedics</option>' +
      '<option value="Neurology">Neurology</option>' +
      '<option value="Oncology">Oncology</option>' +
      '<option value="Ophthalmology">Ophthalmology</option>';
  }

  // Helper: apply filters and sort
  function applyFilters() {
    const specialty = filterSelect ? filterSelect.value : 'all';
    const cityEl = document.getElementById('city-filter');
    const city = cityEl ? cityEl.value : 'all';
    const availEl = document.getElementById('availability-filter');
    const availability = availEl ? availEl.value : 'all';
    const priceEl = document.getElementById('price-filter');
    const priceRange = priceEl ? priceEl.value : 'all';

    let filtered = filterDoctors(specialty, city, availability, priceRange);

    // Apply sort
    const sortEl = document.getElementById('sort-select');
    const sortVal = sortEl ? sortEl.value : 'best-match';
    filtered = sortDoctors(filtered, sortVal);

    currentPage = 1;

    renderDoctorCards(filtered);
    updateResultsCount(filtered.length, specialty);
    updateActiveFilters(specialty);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }

  const cityEl = document.getElementById('city-filter');
  if (cityEl) {
    cityEl.addEventListener('change', applyFilters);
  }

  const availEl = document.getElementById('availability-filter');
  if (availEl) {
    availEl.addEventListener('change', applyFilters);
  }

  const priceFilterEl = document.getElementById('price-filter');
  if (priceFilterEl) {
    priceFilterEl.addEventListener('change', applyFilters);
  }

  const sortEl = document.getElementById('sort-select');
  if (sortEl) {
    sortEl.addEventListener('change', applyFilters);
  }

  // Wire up the static "Clear all" button already in the HTML
  const clearBtn = document.querySelector('.clear-filters');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      clearFilter();
    });
  }

  // Check URL for query params to support deep-linking from the homepage
  const params = new URLSearchParams(window.location.search);
  const urlSpecialty = params.get('specialty');
  const urlCity = params.get('city');
  const urlAvailability = params.get('availability');
  const urlPrice = params.get('price');

  // Apply any incoming URL params to the filter controls
  if (urlSpecialty && filterSelect) {
    const options = Array.from(filterSelect.options);
    const match = options.find(function (opt) {
      return (
        opt.value.toLowerCase() === urlSpecialty.toLowerCase() ||
        opt.text.toLowerCase() === urlSpecialty.toLowerCase()
      );
    });
    if (match) filterSelect.value = match.value;
  }

  const cityEl2 = document.getElementById('city-filter');
  if (urlCity && cityEl2) cityEl2.value = urlCity;

  const availEl2 = document.getElementById('availability-filter');
  if (urlAvailability && availEl2) availEl2.value = urlAvailability;

  const priceEl2 = document.getElementById('price-filter');
  if (urlPrice && priceEl2) priceEl2.value = urlPrice;

  // Always render based on whatever filters are now set (default = all)
  const initSpecialty = filterSelect ? filterSelect.value : 'all';
  const initCity = cityEl2 ? cityEl2.value : 'all';
  const initAvail = availEl2 ? availEl2.value : 'all';
  const initPrice = priceEl2 ? priceEl2.value : 'all';

  const initFiltered = filterDoctors(initSpecialty, initCity, initAvail, initPrice);
  renderDoctorCards(initFiltered);
  updateResultsCount(initFiltered.length, initSpecialty);
  updateActiveFilters(initSpecialty);
}

/* ====== INITIALIZATION ====== */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return; // Only run on search.html

  if (typeof loadDoctorsFromXML === 'function') {
    loadDoctorsFromXML('xml/doctors.xml', function (parsed) {
      doctorsData = Array.isArray(parsed) ? parsed : [];
      initFilters();
    });
    return;
  }

  // Failsafe: run with empty data if xml-loader is unavailable.
  console.error('HealthConnect filter: xml-loader.js is not available; rendering empty results.');
  doctorsData = [];
  initFilters();
});