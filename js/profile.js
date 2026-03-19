/**
 * profile.js
 * Dynamically populates profile.html based on the ?doctor=id URL parameter.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctor') || '001';

    // We need to wait for xml-loader to finish fetching doctors. 
    // It populates the global `doctors` array.
    const interval = setInterval(() => {
        if (typeof doctors !== 'undefined' && doctors.length > 0) {
            clearInterval(interval);
            populateProfile(doctorId);
        }
    }, 50);
});

function buildStarsProfile(rating) {
    const filled = Math.round(parseFloat(rating));
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < filled ? '\u2605' : '\u2606';
    }
    return stars;
}

function populateProfile(id) {
    const doctor = getDoctorById(id);
    // fallback to first doctor if not found
    if (!doctor) return;

    // Update Title
    document.title = doctor.name + ' — HealthConnect';

    // Log this doctor to recently viewed if user is signed in
    if (typeof Auth !== 'undefined') {
        Auth.addRecentDoctor({
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            rating: doctor.rating
        });
    }

    // Update Breadcrumb
    const breadcrumbSpan = document.querySelector('.breadcrumb span:last-child');
    if (breadcrumbSpan) breadcrumbSpan.textContent = doctor.name;

    // Update Sidebar
    const profileImg = document.getElementById('profile-doctor-img');
    if (profileImg) {
        profileImg.src = 'images/doctor_' + doctor.id + '.png';
        profileImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/avatar.svg';
        };
        profileImg.alt = 'Profile photo of ' + doctor.name;
    }

    const sidebarName = document.querySelector('.sidebar-name');
    if (sidebarName) sidebarName.textContent = doctor.name;

    const sidebarSpecialty = document.querySelector('.sidebar-specialty');
    if (sidebarSpecialty) sidebarSpecialty.textContent = doctor.specialty;

    // Update Rating
    const starDisplays = document.querySelectorAll('.star-rating span[aria-hidden="true"]');
    starDisplays.forEach(el => { el.textContent = buildStarsProfile(doctor.rating); });
    const ratingNumbers = document.querySelectorAll('.rating-number');
    ratingNumbers.forEach(el => { el.textContent = doctor.rating; });
    const reviewCounts = document.querySelectorAll('.rating-count');
    reviewCounts.forEach(el => {
        if (el.textContent.includes('reviews')) {
            el.textContent = '(' + doctor.reviewCount + ' reviews)';
        } else {
            el.textContent = '(' + doctor.reviewCount + ')';
        }
    });

    // Sidebar Stats
    const statItems = document.querySelectorAll('.sidebar-stat span:last-child');
    if (statItems.length >= 5) {
        statItems[0].innerHTML = '<strong>Experience:</strong> ' + doctor.experience;
        statItems[1].innerHTML = '<strong>Hospital:</strong> ' + doctor.hospital;
        statItems[2].innerHTML = '<strong>Location:</strong> ' + doctor.city;
        statItems[3].innerHTML = doctor.distance + ' away';
        statItems[4].innerHTML = '<strong>Languages:</strong> ' + doctor.languages.join(', ');
    }
    // Consultation Fee
    const feeStatEl = document.querySelector('.sidebar-fee span:last-child');
    if (feeStatEl && doctor.consultationFee) {
        feeStatEl.innerHTML = '<strong>Consultation Fee:</strong> LKR ' + doctor.consultationFee.toLocaleString();
    }

    // Update Credentials
    const credentialsList = document.querySelector('.credentials-list');
    if (credentialsList) {
        // Keep it simple, just replace with Education
        credentialsList.innerHTML = `
      <div class="credential-item">
        <p class="credential-label">Education & Qualifications</p>
        <p class="credential-value">${doctor.education}</p>
      </div>
      <div class="credential-item">
        <p class="credential-label">Board Certifications</p>
        ${doctor.boardCerts && doctor.boardCerts.length ? doctor.boardCerts.map(c => `<p class="credential-value">${c}</p>`).join('') : '<p class="credential-value">Certified</p>'}
      </div>
    `;
    }

    // Specializations
    const specTags = document.querySelector('.spec-tags');
    if (specTags && doctor.specializations) {
        specTags.innerHTML = doctor.specializations.map(s => `<span class="spec-tag" role="listitem">${s}</span>`).join('');
    }

    // Update Book Appointment button
    const bookBtn = document.querySelector('.sidebar-book-btn');
    if (bookBtn) {
        bookBtn.href = 'booking.html?doctor=' + encodeURIComponent(doctor.id);
    }

    // Main content - About
    const aboutHeading = document.getElementById('about-heading');
    if (aboutHeading) {
        aboutHeading.textContent = 'About ' + doctor.name;
        const aboutGraph = aboutHeading.nextElementSibling;
        if (aboutGraph) {
            aboutGraph.textContent = doctor.about || doctor.name + ' is a dedicated ' + doctor.specialty + ' specialist committed to providing compassionate, evidence-based patient care.';
        }
    }

    // Reviews Header
    const reviewsOverall = document.querySelector('.reviews-summary span:nth-child(2)');
    if (reviewsOverall) reviewsOverall.textContent = ' ' + doctor.rating + ' ';
    const reviewsCountOverall = document.querySelector('.reviews-summary .text-muted');
    if (reviewsCountOverall) reviewsCountOverall.textContent = '(' + doctor.reviewCount + ' reviews)';

    const viewAllBtn = document.querySelector('.view-all-reviews');
    if (viewAllBtn) {
        viewAllBtn.setAttribute('aria-label', 'View all ' + doctor.reviewCount + ' reviews for ' + doctor.name);
    }
}
