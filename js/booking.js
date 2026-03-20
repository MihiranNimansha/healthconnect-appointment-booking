/**
 * booking.js
 * Dynamically populates booking.html based on the ?doctor=id URL parameter.
 */

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctor') || '001';

    const interval = setInterval(() => {
        if (typeof doctors !== 'undefined' && doctors.length > 0) {
            clearInterval(interval);
            const doctor = getDoctorById(doctorId);
            if (doctor) {
                populateBookingSummary(doctor);
                initDynamicTimeSlots(doctor);
            }
        }
    }, 50);
});

function populateBookingSummary(doctor) {

    // Breadcrumb
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
    if (breadcrumbLinks.length >= 3) {
        breadcrumbLinks[2].textContent = doctor.name;
        breadcrumbLinks[2].href = 'profile.html?doctor=' + encodeURIComponent(doctor.id);
    }

    // Doctor Info
    const avatarImg = document.querySelector('.summary-doctor-img, .doctor-avatar-img');
    if (avatarImg) {
        avatarImg.src = 'images/doctor_' + doctor.id + '.png';
        avatarImg.onerror = function () {
            this.onerror = null;
            this.src = 'images/avatar.svg';
        };
        avatarImg.alt = 'Profile photo of ' + doctor.name;
    }

    const doctorName = document.querySelector('.summary-doctor-name');
    if (doctorName) doctorName.textContent = doctor.name;

    const doctorSpec = document.querySelector('.summary-doctor-spec');
    if (doctorSpec) doctorSpec.textContent = doctor.specialty;

    const starDisplays = document.querySelectorAll('.star-rating span[aria-hidden="true"]');
    starDisplays.forEach(el => { el.textContent = buildStars(doctor.rating); });

    const ratingNumbers = document.querySelectorAll('.rating-number');
    ratingNumbers.forEach(el => { el.textContent = doctor.rating; });

    // Location
    const detailRows = document.querySelectorAll('.summary-row-content span:last-child');
    if (detailRows.length >= 3) {
        detailRows[2].textContent = doctor.hospital + ', ' + doctor.city;
    }

    const changeBtn = document.querySelector('.change-datetime-btn');
    if (changeBtn) {
        changeBtn.href = 'profile.html?doctor=' + encodeURIComponent(doctor.id);
    }
}

// === Dynamic Time Slots Logic ===

function initDynamicTimeSlots(doctor) {
    const dateSelect = document.getElementById('appt-date');
    if (!dateSelect || !doctor.schedule || Object.keys(doctor.schedule).length === 0) return;

    // 1. Generate available dates for the next 14 days based on the doctor's schedule
    const availableDates = generateAvailableDates(Object.keys(doctor.schedule), 14);

    // 2. Populate Date Dropdown
    availableDates.forEach(dateObj => {
        const option = document.createElement('option');
        option.value = dateObj.value; // e.g. "2024-11-20"
        option.textContent = dateObj.label; // e.g. "Wed, Nov 20"
        option.dataset.dayName = dateObj.dayName; // e.g. "Wednesday"
        dateSelect.appendChild(option);
    });

    // 3. Listen for Date Change
    dateSelect.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        if (this.value === 'default' || !selectedOption.dataset.dayName) {
            hideTimeSlots();
            return;
        }
        const dayName = selectedOption.dataset.dayName;
        const slots = doctor.schedule[dayName] || [];
        renderTimeSlots(slots);
    });
}

function generateAvailableDates(availableDayNames, daysAhead) {
    const dates = [];
    const today = new Date();

    // Map day index (0-6) to English name to match our XML data
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthsMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 1; i <= daysAhead; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dayName = daysMap[d.getDay()];

        if (availableDayNames.includes(dayName)) {
            const year = d.getFullYear();
            const monthStr = String(d.getMonth() + 1).padStart(2, '0');
            const dateStr = String(d.getDate()).padStart(2, '0');

            const value = `${year}-${monthStr}-${dateStr}`;
            const label = `${dayName.substring(0, 3)}, ${monthsMap[d.getMonth()]} ${d.getDate()}`;

            dates.push({ value, label, dayName });
        }
    }
    return dates;
}

function renderTimeSlots(slots) {
    const containerWrapper = document.getElementById('time-slots-container');
    const container = document.getElementById('time-slots');
    const errorMsg = document.getElementById('time-error');

    if (!container || !containerWrapper) return;

    container.innerHTML = ''; // Clear old

    // XML schedule slots are objects: { time, period, available }
    // Normalize to displayable time strings and ignore unavailable entries.
    const displaySlots = (slots || [])
        .filter(slot => {
            if (typeof slot === 'string') return true;
            return slot && slot.available !== false && !!slot.time;
        })
        .map(slot => (typeof slot === 'string' ? slot : slot.time));

    if (!displaySlots.length) {
        container.innerHTML = '<p class="text-muted">No slots available on this date.</p>';
    } else {
        displaySlots.forEach((slotTime, index) => {
            const id = 'slot-' + index;

            const label = document.createElement('label');
            label.className = 'time-slot';
            label.setAttribute('for', id);

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'time-slot';
            input.id = id;
            input.value = slotTime;

            // When a slot is clicked, remove the error status if any
            input.addEventListener('change', () => {
                container.setAttribute('aria-invalid', 'false');
                if (errorMsg) errorMsg.classList.remove('visible');
                document.querySelectorAll('.time-slot').forEach(l => l.style.borderColor = '');
            });

            const span = document.createElement('span');
            span.textContent = slotTime;

            label.appendChild(input);
            label.appendChild(span);
            container.appendChild(label);
        });
    }

    containerWrapper.style.display = 'block';
}

function hideTimeSlots() {
    const containerWrapper = document.getElementById('time-slots-container');
    if (containerWrapper) {
        containerWrapper.style.display = 'none';
    }
    const container = document.getElementById('time-slots');
    if (container) {
        container.innerHTML = '';
    }
}
