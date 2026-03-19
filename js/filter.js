/**
 * filter.js
 * HealthConnect  CM1605 Web Technology Coursework
 *
 * Handles dynamic filtering of doctor cards on search.html.
 * Filters doctors by specialty and city from the doctorsData array.
 * Works with more than two filter options as required.
 *
 * Author: [Your Name]
 * Date: March 2026
 */

/* =============================================
   FALLBACK DOCTOR DATA
   ============================================= */

/**
 * Inline fallback dataset for 54 Sri Lankan doctors across 8 specialties.
 * Used when xml-loader.js has not yet populated a shared doctors array.
 * Covers Cardiology, General Practice, Pediatrics, Dermatology,
 * Orthopedics, Neurology, Oncology, and Ophthalmology.
 */
const doctorsData = [
  { id: "001", name: "Dr. Priya Perera", specialty: "Cardiology", experience: "18+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.2 km", rating: "4.9", reviewCount: "187", acceptingPatients: true, consultationFee: 4500 },
  { id: "002", name: "Dr. Chaminda Fernando", specialty: "Cardiology", experience: "22+ years", hospital: "Asiri Central Hospital", city: "Colombo", distance: "2.1 km", rating: "5.0", reviewCount: "243", acceptingPatients: true, consultationFee: 5500 },
  { id: "003", name: "Dr. Krishnan Subramaniam", specialty: "Cardiology", experience: "15+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "3.4 km", rating: "4.8", reviewCount: "156", acceptingPatients: true, consultationFee: 4000 },
  { id: "004", name: "Dr. Dilini Jayawardena", specialty: "Cardiology", experience: "12+ years", hospital: "Durdans Hospital", city: "Colombo", distance: "1.8 km", rating: "4.9", reviewCount: "134", acceptingPatients: false, consultationFee: 3500 },
  { id: "005", name: "Dr. Roshan Dissanayake", specialty: "Cardiology", experience: "20+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "4.5 km", rating: "5.0", reviewCount: "312", acceptingPatients: true, consultationFee: 5000 },
  { id: "006", name: "Dr. Farook Marikar", specialty: "Cardiology", experience: "14+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "2.7 km", rating: "4.7", reviewCount: "98", acceptingPatients: true, consultationFee: 3500 },
  { id: "007", name: "Dr. Sachini Weerasinghe", specialty: "Cardiology", experience: "10+ years", hospital: "Hemas Hospital Wattala", city: "Negombo", distance: "5.1 km", rating: "4.8", reviewCount: "112", acceptingPatients: true, consultationFee: 3000 },
  { id: "008", name: "Dr. Rajiv Selvarajah", specialty: "Cardiology", experience: "17+ years", hospital: "Asiri Surgical Hospital", city: "Colombo", distance: "3.2 km", rating: "4.9", reviewCount: "201", acceptingPatients: false, consultationFee: 4500 },
  { id: "009", name: "Dr. Amali Silva", specialty: "General Practice", experience: "8+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.5 km", rating: "4.8", reviewCount: "203", acceptingPatients: true, consultationFee: 2000 },
  { id: "010", name: "Dr. Nuwan Bandara", specialty: "General Practice", experience: "14+ years", hospital: "Base Hospital Kurunegala", city: "Kurunegala", distance: "2.3 km", rating: "4.7", reviewCount: "167", acceptingPatients: true, consultationFee: 2500 },
  { id: "011", name: "Dr. Thilini Karunaratne", specialty: "General Practice", experience: "6+ years", hospital: "Ninewells Hospital", city: "Colombo", distance: "1.9 km", rating: "4.9", reviewCount: "89", acceptingPatients: true, consultationFee: 1800 },
  { id: "012", name: "Dr. Suresh Arulpragasam", specialty: "General Practice", experience: "11+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "3.7 km", rating: "4.8", reviewCount: "134", acceptingPatients: true, consultationFee: 2200 },
  { id: "013", name: "Dr. Manel Ranasinghe", specialty: "General Practice", experience: "9+ years", hospital: "Karapitiya Teaching Hospital Galle", city: "Galle", distance: "4.1 km", rating: "4.6", reviewCount: "78", acceptingPatients: true, consultationFee: 2000 },
  { id: "014", name: "Dr. Kavitha Navaratnam", specialty: "General Practice", experience: "13+ years", hospital: "Hemas Hospital Wattala", city: "Negombo", distance: "2.8 km", rating: "4.9", reviewCount: "156", acceptingPatients: false, consultationFee: 2500 },
  { id: "015", name: "Dr. Ismail Caffoor", specialty: "General Practice", experience: "7+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "2.2 km", rating: "4.7", reviewCount: "91", acceptingPatients: true, consultationFee: 1800 },
  { id: "016", name: "Dr. Chamari Senanayake", specialty: "General Practice", experience: "16+ years", hospital: "National Hospital of Sri Lanka", city: "Colombo", distance: "1.1 km", rating: "5.0", reviewCount: "278", acceptingPatients: true, consultationFee: 3000 },
  { id: "017", name: "Dr. Prasad Gunawardena", specialty: "General Practice", experience: "5+ years", hospital: "Negombo District General Hospital", city: "Negombo", distance: "3.5 km", rating: "4.6", reviewCount: "67", acceptingPatients: true, consultationFee: 1500 },
  { id: "018", name: "Dr. Vindya Kumara", specialty: "General Practice", experience: "12+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "5.3 km", rating: "4.8", reviewCount: "143", acceptingPatients: true, consultationFee: 2200 },
  { id: "019", name: "Dr. Emily Wickramasinghe", specialty: "Pediatrics", experience: "10+ years", hospital: "Asiri Central Hospital", city: "Colombo", distance: "2.4 km", rating: "5.0", reviewCount: "198", acceptingPatients: true, consultationFee: 2500 },
  { id: "020", name: "Dr. Murugesan Sivanesan", specialty: "Pediatrics", experience: "16+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "4.2 km", rating: "4.9", reviewCount: "221", acceptingPatients: true, consultationFee: 3500 },
  { id: "021", name: "Dr. Nadeesha Rajapaksa", specialty: "Pediatrics", experience: "8+ years", hospital: "Durdans Hospital", city: "Colombo", distance: "1.7 km", rating: "4.8", reviewCount: "112", acceptingPatients: true, consultationFee: 2200 },
  { id: "022", name: "Dr. Tharaka Senanayake", specialty: "Pediatrics", experience: "13+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "3.9 km", rating: "4.9", reviewCount: "167", acceptingPatients: false, consultationFee: 3000 },
  { id: "023", name: "Dr. Anusha Balasingham", specialty: "Pediatrics", experience: "11+ years", hospital: "Karapitiya Teaching Hospital Galle", city: "Galle", distance: "5.6 km", rating: "4.7", reviewCount: "89", acceptingPatients: true, consultationFee: 2800 },
  { id: "024", name: "Dr. Lahiru Jayawardena", specialty: "Pediatrics", experience: "6+ years", hospital: "Hemas Hospital Wattala", city: "Negombo", distance: "2.6 km", rating: "4.8", reviewCount: "78", acceptingPatients: true, consultationFee: 2000 },
  { id: "025", name: "Dr. Prabhath Dissanayake", specialty: "Pediatrics", experience: "19+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "2.9 km", rating: "5.0", reviewCount: "289", acceptingPatients: true, consultationFee: 4000 },
  { id: "026", name: "Dr. Sanduni Perera", specialty: "Dermatology", experience: "9+ years", hospital: "Ninewells Hospital", city: "Colombo", distance: "2.1 km", rating: "4.8", reviewCount: "145", acceptingPatients: true, consultationFee: 2800 },
  { id: "027", name: "Dr. Ratnasingham Jeyarajah", specialty: "Dermatology", experience: "14+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "3.8 km", rating: "4.9", reviewCount: "178", acceptingPatients: true, consultationFee: 3500 },
  { id: "028", name: "Dr. Kalani Fernando", specialty: "Dermatology", experience: "7+ years", hospital: "Asiri Surgical Hospital", city: "Colombo", distance: "1.6 km", rating: "4.7", reviewCount: "97", acceptingPatients: true, consultationFee: 2500 },
  { id: "029", name: "Dr. Harsha Gunawardena", specialty: "Dermatology", experience: "21+ years", hospital: "Durdans Hospital", city: "Colombo", distance: "2.3 km", rating: "5.0", reviewCount: "267", acceptingPatients: false, consultationFee: 5000 },
  { id: "030", name: "Dr. Nimali Wickramasinghe", specialty: "Dermatology", experience: "11+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "4.7 km", rating: "4.8", reviewCount: "134", acceptingPatients: true, consultationFee: 3000 },
  { id: "031", name: "Dr. Nazeer Thassim", specialty: "Dermatology", experience: "8+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "3.1 km", rating: "4.6", reviewCount: "86", acceptingPatients: true, consultationFee: 2500 },
  { id: "032", name: "Dr. Asanka Rajapaksa", specialty: "Orthopedics", experience: "17+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.4 km", rating: "4.9", reviewCount: "213", acceptingPatients: true, consultationFee: 4500 },
  { id: "033", name: "Dr. Niroshan Bandara", specialty: "Orthopedics", experience: "13+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "4.3 km", rating: "4.8", reviewCount: "167", acceptingPatients: true, consultationFee: 3500 },
  { id: "034", name: "Dr. Shankar Krishnan", specialty: "Orthopedics", experience: "20+ years", hospital: "Colombo South Teaching Hospital", city: "Colombo", distance: "3.7 km", rating: "5.0", reviewCount: "298", acceptingPatients: false, consultationFee: 5500 },
  { id: "035", name: "Dr. Tharindi Ranasinghe", specialty: "Orthopedics", experience: "9+ years", hospital: "Asiri Central Hospital", city: "Colombo", distance: "2.5 km", rating: "4.7", reviewCount: "123", acceptingPatients: true, consultationFee: 3000 },
  { id: "036", name: "Dr. Buddika Karunaratne", specialty: "Orthopedics", experience: "14+ years", hospital: "Karapitiya Teaching Hospital Galle", city: "Galle", distance: "5.9 km", rating: "4.8", reviewCount: "156", acceptingPatients: true, consultationFee: 3500 },
  { id: "037", name: "Dr. Iresha Seneviratne", specialty: "Orthopedics", experience: "11+ years", hospital: "Hemas Hospital Wattala", city: "Negombo", distance: "3.3 km", rating: "4.9", reviewCount: "145", acceptingPatients: true, consultationFee: 3000 },
  { id: "038", name: "Dr. Pradeep Jayasinghe", specialty: "Orthopedics", experience: "24+ years", hospital: "Durdans Hospital", city: "Colombo", distance: "2.0 km", rating: "5.0", reviewCount: "312", acceptingPatients: false, consultationFee: 6000 },
  { id: "039", name: "Dr. Malini Wickramasinghe", specialty: "Neurology", experience: "16+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "2.8 km", rating: "4.9", reviewCount: "189", acceptingPatients: true, consultationFee: 4500 },
  { id: "040", name: "Dr. Arulpragasam Sivakumar", specialty: "Neurology", experience: "12+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "4.6 km", rating: "4.8", reviewCount: "134", acceptingPatients: true, consultationFee: 3500 },
  { id: "041", name: "Dr. Damith Senanayake", specialty: "Neurology", experience: "18+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.3 km", rating: "5.0", reviewCount: "245", acceptingPatients: true, consultationFee: 5000 },
  { id: "042", name: "Dr. Saranga Kumara", specialty: "Neurology", experience: "8+ years", hospital: "Asiri Central Hospital", city: "Colombo", distance: "2.6 km", rating: "4.7", reviewCount: "98", acceptingPatients: false, consultationFee: 3000 },
  { id: "043", name: "Dr. Vithura Ratnasingham", specialty: "Neurology", experience: "14+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "5.2 km", rating: "4.9", reviewCount: "167", acceptingPatients: true, consultationFee: 4000 },
  { id: "044", name: "Dr. Chamari Jayawardena", specialty: "Neurology", experience: "10+ years", hospital: "Ninewells Hospital", city: "Colombo", distance: "1.9 km", rating: "4.8", reviewCount: "112", acceptingPatients: true, consultationFee: 3000 },
  { id: "045", name: "Dr. Sampath Rajapaksa", specialty: "Oncology", experience: "22+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.6 km", rating: "5.0", reviewCount: "278", acceptingPatients: true, consultationFee: 6500 },
  { id: "046", name: "Dr. Renuka Perera", specialty: "Oncology", experience: "15+ years", hospital: "Apeksha Hospital", city: "Colombo", distance: "2.4 km", rating: "4.9", reviewCount: "198", acceptingPatients: true, consultationFee: 5000 },
  { id: "047", name: "Dr. Janaki Balasingham", specialty: "Oncology", experience: "11+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "5.1 km", rating: "4.8", reviewCount: "145", acceptingPatients: false, consultationFee: 4000 },
  { id: "048", name: "Dr. Vimukthi Dissanayake", specialty: "Oncology", experience: "19+ years", hospital: "Lanka Hospitals", city: "Colombo", distance: "3.2 km", rating: "4.9", reviewCount: "223", acceptingPatients: true, consultationFee: 5500 },
  { id: "049", name: "Dr. Nadeeka Fernando", specialty: "Oncology", experience: "8+ years", hospital: "Asiri Surgical Hospital", city: "Colombo", distance: "2.1 km", rating: "4.7", reviewCount: "87", acceptingPatients: true, consultationFee: 3500 },
  { id: "050", name: "Dr. Vindya Karunaratne", specialty: "Ophthalmology", experience: "13+ years", hospital: "Nawaloka Hospital", city: "Colombo", distance: "1.8 km", rating: "4.9", reviewCount: "167", acceptingPatients: true, consultationFee: 3500 },
  { id: "051", name: "Dr. Thirugnana Murugesan", specialty: "Ophthalmology", experience: "18+ years", hospital: "Jaffna Teaching Hospital", city: "Jaffna", distance: "4.4 km", rating: "5.0", reviewCount: "234", acceptingPatients: true, consultationFee: 4500 },
  { id: "052", name: "Dr. Kasun Weerasinghe", specialty: "Ophthalmology", experience: "9+ years", hospital: "Durdans Hospital", city: "Colombo", distance: "2.3 km", rating: "4.8", reviewCount: "123", acceptingPatients: true, consultationFee: 2800 },
  { id: "053", name: "Dr. Sulochana Ranasinghe", specialty: "Ophthalmology", experience: "15+ years", hospital: "Teaching Hospital Kandy", city: "Kandy", distance: "4.8 km", rating: "4.9", reviewCount: "189", acceptingPatients: false, consultationFee: 4000 },
  { id: "054", name: "Dr. Harith Ismail", specialty: "Ophthalmology", experience: "11+ years", hospital: "Asiri Central Hospital", city: "Colombo", distance: "2.7 km", rating: "4.8", reviewCount: "145", acceptingPatients: true, consultationFee: 3000 }
];

/* =============================================
   FILTER FUNCTIONS
   ============================================= */

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
 * Generates a five-character star string from a numeric rating.
 * Filled stars () up to the rounded value, empty stars () for the rest.
 *
 * @param {string|number} rating - Numeric rating e.g. "4.8"
 * @returns {string} Star string e.g. ""
 */
function buildStars(rating) {
  const filled = Math.round(parseFloat(rating));
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < filled ? '\u2605' : '\u2606'; //  / 
  }
  return stars;
}

/**
 * Sorts a copy of the doctors array by the specified criteria.
 *
 * @param {Array}  arr     - Array of doctor objects
 * @param {string} sortBy  - Sort key: "best-match" | "rating" | "distance" | "experience" | "price-asc" | "price-desc"
 * @returns {Array} New sorted array (original is not mutated)
 */
function sortDoctors(arr, sortBy) {
  var copy = arr.slice();
  if (sortBy === 'rating') {
    copy.sort(function (a, b) { return parseFloat(b.rating) - parseFloat(a.rating); });
  } else if (sortBy === 'distance') {
    copy.sort(function (a, b) { return parseFloat(a.distance) - parseFloat(b.distance); });
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
    return;
  }

  doctorsArray.forEach(function (doctor) {
    const stars = buildStars(doctor.rating);

    const card = document.createElement('article');
    card.className = 'card result-card';
    card.setAttribute('aria-label', doctor.name);

    // ---- Header row: avatar + info block ----
    const header = document.createElement('div');
    header.className = 'result-card-header';

    // Generate avatar image with fallback to ui-avatars.com
    const avatarUrl = 'images/doctor_' + doctor.id + '.png';
    const fallbackUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=random&color=fff&size=128';

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

    // ---- Meta details: experience, hospital, distance ----
    const meta = document.createElement('div');
    meta.className = 'doctor-meta';

    [doctor.experience, doctor.hospital, doctor.distance].forEach(function (text) {
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
    favBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="' + (isFav ? '#e11d48' : 'none') + '" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
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
  renderDoctorCards(all);
  updateResultsCount(all.length, 'all');
  updateActiveFilters('all');
}

/**
 * Initialises all filter event listeners on search.html.
 * Updates specialty options to all 8 Sri Lankan specialties.
 * Adds a city filter dynamically if not already present in the DOM.
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

  // Add city filter dynamically if not already present in the HTML
  if (!document.getElementById('city-filter')) {
    const citySelect = document.createElement('select');
    citySelect.id = 'city-filter';
    citySelect.className = 'form-control';
    citySelect.setAttribute('aria-label', 'Filter by city');
    citySelect.innerHTML =
      '<option value="all">All Cities</option>' +
      '<option value="Colombo">Colombo</option>' +
      '<option value="Kandy">Kandy</option>' +
      '<option value="Jaffna">Jaffna</option>' +
      '<option value="Negombo">Negombo</option>' +
      '<option value="Galle">Galle</option>' +
      '<option value="Kurunegala">Kurunegala</option>';
    if (filterSelect) {
      const specialtyField = filterSelect.closest('.search-field') || filterSelect.parentElement;
      if (specialtyField && specialtyField.parentElement) {
        specialtyField.parentElement.insertBefore(citySelect, specialtyField.nextSibling);
      }
    }
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

  // Wire up any static tag-dismiss buttons already in the HTML
  const staticDismissButtons = document.querySelectorAll('.tag-dismiss');
  staticDismissButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      clearFilter();
    });
  });

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

/* =============================================
   INITIALISATION
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
  const grid = document.getElementById('doctors-grid');
  if (!grid) return; // Only run on search.html
  initFilters();
});