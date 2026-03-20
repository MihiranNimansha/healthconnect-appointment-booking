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

function getInitials(name) {
        return name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part.charAt(0).toUpperCase())
                .join('');
}

function createRecentReviews(doctor) {
        const names = [
                'Kamal S.',
                'Nimali P.',
                'Ruwan T.',
                'Sanduni M.',
                'Ishara D.',
                'Tharindu J.'
        ];
        const dates = ['1 week ago', '3 weeks ago', '2 months ago'];
        const ratingNum = Math.max(4, Math.round(parseFloat(doctor.rating || '5')));

        return [
                {
                        reviewer: names[(parseInt(doctor.id, 10) + 1) % names.length],
                        date: dates[0],
                        rating: ratingNum,
                        text: `${doctor.name} explained my condition clearly and gave a practical treatment plan. I felt supported throughout the consultation.`
                },
                {
                        reviewer: names[(parseInt(doctor.id, 10) + 3) % names.length],
                        date: dates[1],
                        rating: ratingNum,
                        text: `Very professional ${doctor.specialty.toLowerCase()} consultation. ${doctor.name} was patient, detailed, and answered all of my questions.`
                },
                {
                        reviewer: names[(parseInt(doctor.id, 10) + 5) % names.length],
                        date: dates[2],
                        rating: ratingNum,
                        text: `Excellent experience at ${doctor.hospital}. ${doctor.name} listens carefully and provides compassionate, evidence-based care.`
                }
        ];
}

function renderRecentReviews(doctor) {
        const container = document.getElementById('reviews-list');
        if (!container) return;

        const reviews = createRecentReviews(doctor);
        container.innerHTML = reviews.map(review => `
            <article class="review-card" aria-label="Review by ${review.reviewer}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar" role="img" aria-label="Reviewer avatar for ${review.reviewer}">${getInitials(review.reviewer)}</div>
                        <div>
                            <p class="reviewer-name">${review.reviewer}</p>
                            <div class="star-rating" aria-label="Rating: ${review.rating} out of 5 stars">
                                <span aria-hidden="true">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                            </div>
                        </div>
                    </div>
                    <span class="review-date">${review.date}</span>
                </div>
                <p class="review-text">${review.text}</p>
            </article>
        `).join('');
}

function populateProfile(id) {
    const doctor = getDoctorById(id);
    // fallback to first doctor if not found
    if (!doctor) return;

    // Update Title
    document.title = doctor.name + ' — HealthConnect';


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
    starDisplays.forEach(el => { el.textContent = buildStars(doctor.rating); });
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
    if (statItems.length >= 4) {
        statItems[0].innerHTML = '<strong>Experience:</strong> ' + doctor.experience;
        statItems[1].innerHTML = '<strong>Hospital:</strong> ' + doctor.hospital;
        statItems[2].innerHTML = '<strong>Location:</strong> ' + doctor.city;
        statItems[3].innerHTML = '<strong>Languages:</strong> ' + doctor.languages.join(', ');
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
        const aboutSection = aboutHeading.closest('section');
        if (aboutSection) {
            const paragraphs = aboutSection.querySelectorAll('p');
            if (paragraphs[0]) {
                paragraphs[0].textContent = doctor.about || (doctor.name + ' is a dedicated ' + doctor.specialty + ' specialist committed to providing compassionate, evidence-based patient care.');
            }
            if (paragraphs[1]) {
                paragraphs[1].textContent = `${doctor.name} has ${doctor.experience} of clinical experience and practices at ${doctor.hospital}. Patients value clear explanations, careful diagnosis, and a patient-centred treatment approach.`;
            }
        }
    }

    // Reviews Header
    const reviewsOverall = document.querySelector('.reviews-summary span:nth-child(2)');
    if (reviewsOverall) reviewsOverall.textContent = ' ' + doctor.rating + ' ';
    const reviewsCountOverall = document.querySelector('.reviews-summary .text-muted');
    if (reviewsCountOverall) reviewsCountOverall.textContent = '(' + doctor.reviewCount + ' reviews)';

    renderRecentReviews(doctor);
}
