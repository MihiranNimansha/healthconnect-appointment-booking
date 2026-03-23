/* timeslots.js
 * Renders doctor slots from XML on profile.html.
 */

/* ====== PER-DOCTOR SCHEDULE DATA ====== */

/* Loaded from doctors.xml via xml-loader.js
 * Shape: { [doctorId]: { [dayName]: ["9:00 AM", ...] } } */
let doctorSchedules = {};

function hydrateSchedulesFromDoctors(parsedDoctors) {
  const nextSchedules = {};

  if (!Array.isArray(parsedDoctors)) {
    doctorSchedules = {};
    return;
  }

  parsedDoctors.forEach(function (doctor) {
    if (!doctor || !doctor.id || !doctor.schedule) {
      return;
    }

    const daySchedule = {};
    Object.keys(doctor.schedule).forEach(function (dayName) {
      const slots = Array.isArray(doctor.schedule[dayName]) ? doctor.schedule[dayName] : [];
      daySchedule[dayName] = slots
        .filter(function (slot) {
          return slot && slot.available !== false;
        })
        .map(function (slot) {
          return typeof slot === 'string' ? slot : (slot.time || '');
        })
        .filter(function (time) {
          return time !== '';
        });
    });

    nextSchedules[doctor.id] = daySchedule;
  });

  doctorSchedules = nextSchedules;
}
/** Tracks which doctor is currently displayed (default: doctor ID 001). */
let currentDoctorId = '001';

/** Tracks the currently highlighted calendar date number (default: March 15). */
let currentSelectedDate = new Date().getDate();

/* ====== HELPER FUNCTIONS ====== */

/**
 * Converts a date string or Date object to the full weekday name.
 * Uses the 'en-US' locale for consistent output across environments.
 * e.g. new Date(2024, 2, 15) → "Friday"
 *
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Full day name e.g. "Monday"
 */
function getDayName(dateString) {
  const date = (dateString instanceof Date) ? dateString : new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Determines whether a time slot falls in the morning (AM).
 * Returns true if the time string contains "AM" (case-sensitive).
 *
 * @param {string} timeString - Display time e.g. "9:00 AM"
 * @returns {boolean} true for morning slots, false for afternoon/evening
 */
function isMorningSlot(timeString) {
  return timeString.includes('AM');
}

function getSlotsForDay(dayName) {
  const doctorSchedule = doctorSchedules[currentDoctorId] || {};
  return doctorSchedule[dayName] || [];
}

function hasSlotsForDay(doctorId, dayName) {
  const doctorSchedule = doctorSchedules[doctorId] || {};
  const slots = doctorSchedule[dayName] || [];
  return Array.isArray(slots) && slots.length > 0;
}

function updateAvailableTimesHeading(dayName) {
  const heading = document.querySelector('.available-times-heading');
  if (!heading) return null;

  const now = new Date();
  const dateObj = new Date(now.getFullYear(), now.getMonth(), currentSelectedDate);
  const dateStr = dateObj.toLocaleDateString('en-LK', { month: 'long', day: 'numeric' });
  heading.textContent = 'Available Times \u2014 ' + dayName + ', ' + dateStr;
  return heading;
}

function showNoSlotsMessage(dayName, heading) {
  let noSlotsMsg = document.getElementById('no-slots-message');
  if (!noSlotsMsg) {
    noSlotsMsg = document.createElement('p');
    noSlotsMsg.id = 'no-slots-message';
    noSlotsMsg.className = 'no-slots-message';
    if (heading && heading.parentNode) {
      heading.parentNode.insertBefore(noSlotsMsg, heading.nextSibling);
    }
  }
  noSlotsMsg.textContent = 'No appointments available on ' + dayName + '.';
}

function hideNoSlotsMessage() {
  const prevMsg = document.getElementById('no-slots-message');
  if (prevMsg) prevMsg.remove();
}

function getSelectedDayName() {
  const selectedDay = document.querySelector('.calendar-day.selected');
  if (selectedDay) {
    const dateNum = parseInt(selectedDay.textContent.trim(), 10);
    if (!isNaN(dateNum)) {
      currentSelectedDate = dateNum;
      const now = new Date();
      return getDayName(new Date(now.getFullYear(), now.getMonth(), dateNum));
    }
  }

  const now = new Date();
  return getDayName(new Date(now.getFullYear(), now.getMonth(), currentSelectedDate));
}

/* ====== TIME SLOT FUNCTIONS ====== */

/**
 * Loads and renders the available time slots for a given day name.
 * Looks up the day in the current doctor's schedule, splits by AM/PM, then calls
 * renderTimeSlots(). Also updates the section heading.
 * Shows a "no availability" message when the day has no slots.
 *
 * @param {string} dayName - Full day name e.g. "Friday"
 */
function loadTimeSlots(dayName) {
  const slots = getSlotsForDay(dayName);
  const heading = updateAvailableTimesHeading(dayName);

  const morningSection = document.getElementById('morning-slots');
  const afternoonSection = document.getElementById('afternoon-slots');

  if (slots.length === 0) {
    // Hide both timeslot sections when there is no availability
    if (morningSection) morningSection.style.display = 'none';
    if (afternoonSection) afternoonSection.style.display = 'none';

    showNoSlotsMessage(dayName, heading);
    return;
  }

  // Remove the no-slots notice if it was shown for a previously selected day
  hideNoSlotsMessage();

  // Restore sections that may have been hidden for a day with no slots
  if (morningSection) morningSection.style.display = '';
  if (afternoonSection) afternoonSection.style.display = '';

  // Partition the flat slots array into morning (AM) and afternoon (PM) buckets
  const morningSlots = slots.filter(function (t) { return isMorningSlot(t); });
  const afternoonSlots = slots.filter(function (t) { return !isMorningSlot(t); });

  renderTimeSlots(morningSlots, afternoonSlots);
}

/**
 * Renders morning and afternoon time slot grids on profile.html.
 * Clears each section's grid before repopulating with fresh buttons.
 * Hides a section entirely when it has no slots for the selected day.
 * Each button is wired to selectTimeSlot() via onclick.
 *
 * @param {Array} morningSlots   - Array of AM time display strings
 * @param {Array} afternoonSlots - Array of PM time display strings
 */
function renderTimeSlots(morningSlots, afternoonSlots) {
  /**
   * Renders one time-period section (morning or afternoon).
   *
   * @param {string} sectionId - DOM id of the section element
   * @param {Array}  slots     - Time strings to render
   * @param {string} label     - Period label e.g. "Morning"
   */
  function renderSection(sectionId, slots, label) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Hide the section completely when there are no slots for this period
    if (slots.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Make section visible in case it was previously hidden
    section.style.display = '';

    // Clear previously rendered slot buttons from the grid
    const grid = section.querySelector('.timeslot-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Update the "Morning" / "Afternoon" period label
    const periodLabel = section.querySelector('.timeslot-period');
    if (periodLabel) {
      periodLabel.textContent = label;
    }

    // Create one button per available time string
    slots.forEach(function (timeStr) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'timeslot-btn';
      btn.textContent = timeStr;
      btn.setAttribute('data-time', timeStr);
      btn.setAttribute('aria-label', 'Select ' + timeStr + ' slot');
      btn.setAttribute('aria-pressed', 'false');
      // Inline onclick keeps selectTimeSlot accessible in page scope
      btn.onclick = function () { selectTimeSlot(this); };
      grid.appendChild(btn);
    });
  }

  renderSection('morning-slots', morningSlots, 'Morning');
  renderSection('afternoon-slots', afternoonSlots, 'Afternoon');
}

/**
 * Selects a time slot and updates summary/button state.
 * @param {HTMLElement} slotElement - Clicked .timeslot-btn
 */
function selectTimeSlot(slotElement) {
  // Remove "selected" state from every currently visible slot button
  const allSlots = document.querySelectorAll('.timeslot-btn');
  allSlots.forEach(function (btn) {
    btn.classList.remove('selected');
    btn.setAttribute('aria-pressed', 'false');
  });

  // Apply "selected" state to the chosen slot
  slotElement.classList.add('selected');
  slotElement.setAttribute('aria-pressed', 'true');

  const selectedTime = slotElement.getAttribute('data-time');

  // Update the booking summary sidebar time display if it exists in the page
  const selectedTimeEl =
    document.getElementById('selected-time') ||
    document.querySelector('.selected-time');
  if (selectedTimeEl) {
    selectedTimeEl.textContent = selectedTime;
  }

  // Enable the "Book Appointment" button if it was rendered as disabled
  const bookBtn = document.querySelector('.sidebar-book-btn, .btn-book, [data-book-btn]');
  if (bookBtn && bookBtn.hasAttribute('disabled')) {
    bookBtn.removeAttribute('disabled');
  }
}

/* Initialize clickable calendar dates on profile.html. */
/**
 * Generates a dynamic calendar for the current month.
 * Replaces the static March 2024 calendar in profile.html.
 * Updates the month title, day numbers, and marks days correctly.
 */
function generateCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Update title
  const title = document.getElementById('calendar-month-title');
  if (title) {
    title.textContent = now.toLocaleDateString('en-LK',
      { month: 'long', year: 'numeric' });
  }

  // Get first day and total days in month
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Find the calendar grid
  const grid = document.querySelector('.calendar-grid');
  if (!grid) return;

  // Keep only the 7 day-name header cells
  const dayNames = Array.from(grid.querySelectorAll('.calendar-day-name'));
  grid.innerHTML = '';
  dayNames.forEach(function (dn) { grid.appendChild(dn); });

  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day empty';
    grid.appendChild(empty);
  }

  // Add day cells
  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement('div');
    const date = new Date(year, month, day);
    const dayName = date.toLocaleDateString('en-LK', { weekday: 'long' });
    const hasAppointments = hasSlotsForDay(currentDoctorId, dayName);

    cell.textContent = day;

    if (day < today) {
      // Past days - unavailable
      cell.className = 'calendar-day unavailable';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', unavailable');
      cell.setAttribute('aria-disabled', 'true');
    } else if (dayName === 'Sunday') {
      // Sundays - unavailable
      cell.className = 'calendar-day unavailable';
      cell.setAttribute('aria-label', 'Sunday ' + day + ', no appointments');
      cell.setAttribute('aria-disabled', 'true');
    } else if (!hasAppointments) {
      // Weekday with no schedule entries for this doctor
      cell.className = 'calendar-day unavailable';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', no appointments');
      cell.setAttribute('aria-disabled', 'true');
    } else if (day === today) {
      // Today - selected by default
      cell.className = 'calendar-day available selected';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', today, selected');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'gridcell');
    } else {
      // Future weekdays - available
      cell.className = 'calendar-day available';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', available');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'gridcell');
    }

    grid.appendChild(cell);
  }
}
/**
 * Sets the currently displayed doctor and reloads time slots.
 * Called from initCalendar() using the ?doctor= URL parameter.
 * Falls back to "001" if no parameter is found.
 * Reloads the currently selected day after changing the doctor id.
 *
 * @param {string} doctorId - Doctor id string e.g. "002"
 */
function setCurrentDoctor(doctorId) {
  // Accept only ids that exist in doctorSchedules; otherwise keep the default
  if (doctorSchedules[doctorId]) {
    currentDoctorId = doctorId;
  } else {
    const availableDoctorIds = Object.keys(doctorSchedules);
    currentDoctorId = availableDoctorIds.length > 0 ? availableDoctorIds[0] : '001';
  }

  // Rebuild date availability state for this doctor.
  initCalendar();

  // Reload the time slots for the currently selected calendar day
  loadTimeSlots(getSelectedDayName());
}

function clearCalendarSelection() {
  const allDays = document.querySelectorAll('.calendar-day');
  allDays.forEach(function (d) {
    d.classList.remove('selected');
    d.removeAttribute('aria-selected');
  });
}

function selectCalendarDay(dayEl) {
  clearCalendarSelection();
  dayEl.classList.add('selected');
  dayEl.setAttribute('aria-selected', 'true');

  const dateNum = parseInt(dayEl.textContent.trim(), 10);
  currentSelectedDate = dateNum;
  const now = new Date();
  const fullDate = new Date(now.getFullYear(), now.getMonth(), dateNum);
  loadTimeSlots(getDayName(fullDate));
}

function initCalendar() {
  // Generate the dynamic calendar for the current month before setting up handlers
  generateCalendar();
  const availableDays = document.querySelectorAll('.calendar-day.available');

  availableDays.forEach(function (dayEl) {
    // Click handler: select the date and update the time slots section
    dayEl.addEventListener('click', function () {
      selectCalendarDay(dayEl);
    });

    // Keyboard accessibility: activate on Enter or Space
    dayEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dayEl.click();
      }
    });
  });
}

/* ======= INITIALIZATION ======= */

document.addEventListener('DOMContentLoaded', function () {
  // Guard: only run on profile.html which contains the calendar wrapper
  const calendar = document.querySelector('.calendar-wrapper');
  if (!calendar) return;

  if (typeof loadDoctorsFromXML !== 'function') {
    console.error('HealthConnect timeslots: xml-loader.js is required to load schedules from XML.');
    return;
  }

  loadDoctorsFromXML('xml/doctors.xml', function (parsedDoctors) {
    hydrateSchedulesFromDoctors(parsedDoctors);

    // Read doctor id from URL query string (?doctor=002 etc.)
    const urlParams = new URLSearchParams(window.location.search);
    const doctorId = urlParams.get('doctor') || '001';
    // setCurrentDoctor also triggers loadTimeSlots internally
    setCurrentDoctor(doctorId);
  });
});
