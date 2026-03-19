/**
 * timeslots.js
 * HealthConnect — CM1605 Web Technology Coursework
 *
 * Handles dynamic time slot display on profile.html.
 * Updates available appointment slots when a date is selected
 * on the calendar. Splits slots into Morning and Afternoon sections.
 *
 * Author: [Your Name]
 * Date: March 2026
 */

/* =============================================
   PER-DOCTOR SCHEDULE DATA
   ============================================= */

/**
 * Individual doctor schedules keyed by doctor id.
 * Each sub-object maps day names to arrays of display time strings.
 * Used by loadTimeSlots() when currentDoctorId is set.
 */
const schedulePatterns = {
  A: {
    Monday:    ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","2:00 PM","2:30 PM","3:00 PM"],
    Tuesday:   ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
    Wednesday: ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","2:00 PM","3:00 PM","4:00 PM"],
    Thursday:  ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
    Friday:    ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","2:00 PM","3:00 PM"],
    Saturday:  ["9:00 AM","10:00 AM","11:00 AM"],
    Sunday:    []
  },
  B: {
    Monday:    ["2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM"],
    Tuesday:   ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"],
    Wednesday: ["2:00 PM","3:00 PM","4:00 PM"],
    Thursday:  ["9:00 AM","10:00 AM","11:00 AM","11:30 AM"],
    Friday:    ["2:00 PM","2:30 PM","3:00 PM","3:30 PM"],
    Saturday:  ["9:00 AM","10:00 AM","11:00 AM"],
    Sunday:    []
  },
  C: {
    Monday:    ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM"],
    Tuesday:   ["9:00 AM","9:30 AM","10:00 AM","11:00 AM"],
    Wednesday: ["9:00 AM","10:00 AM","11:00 AM","11:30 AM"],
    Thursday:  ["9:00 AM","9:30 AM","10:00 AM","10:30 AM"],
    Friday:    ["9:00 AM","10:00 AM","11:00 AM"],
    Saturday:  [],
    Sunday:    []
  },
  D: {
    Monday:    ["1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM"],
    Tuesday:   ["1:00 PM","2:00 PM","3:00 PM","4:00 PM","4:30 PM"],
    Wednesday: ["1:00 PM","1:30 PM","2:00 PM","3:00 PM"],
    Thursday:  ["1:00 PM","2:00 PM","3:00 PM","3:30 PM","4:00 PM"],
    Friday:    ["1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM"],
    Saturday:  [],
    Sunday:    []
  },
  E: {
    Monday:    ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
    Tuesday:   [],
    Wednesday: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
    Thursday:  [],
    Friday:    ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM"],
    Saturday:  ["9:00 AM","10:00 AM"],
    Sunday:    []
  },
  F: {
    Monday:    ["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM"],
    Tuesday:   ["9:00 AM","10:00 AM","2:00 PM","3:00 PM","4:00 PM"],
    Wednesday: ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM"],
    Thursday:  ["9:00 AM","10:00 AM","1:00 PM","2:00 PM","3:00 PM"],
    Friday:    ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"],
    Saturday:  ["10:00 AM","11:00 AM"],
    Sunday:    []
  }
};

const doctorSchedules = {};
const patternMap = { 0: 'F', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
for (let i = 1; i <= 54; i++) {
  const id = String(i).padStart(3, '0');
  const lastDigit = i % 6;
  doctorSchedules[id] = schedulePatterns[patternMap[lastDigit]];
}
/** Tracks which doctor is currently displayed (default: Dr. Sarah Johnson). */
let currentDoctorId = '001';

/* =============================================
   FALLBACK SCHEDULE DATA
   ============================================= */

/**
 * Default weekly schedule used when XML doctor data is unavailable.
 * Keys are full day names; values are arrays of display time strings.
 * Sunday is empty to demonstrate the "no availability" state.
 */
const scheduleData = {
  "Monday":    ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM"],
  "Tuesday":   ["9:00 AM","9:30 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"],
  "Wednesday": ["10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","2:00 PM","3:00 PM","3:30 PM","4:00 PM"],
  "Thursday":  ["9:00 AM","9:30 AM","10:00 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM"],
  "Friday":    ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"],
  "Saturday":  ["10:00 AM","10:30 AM","11:00 AM","11:30 AM"],
  "Sunday":    []
};

/** Tracks the currently highlighted calendar date number (default: March 15). */
let currentSelectedDate = new Date().getDate();

/* =============================================
   HELPER FUNCTIONS
   ============================================= */

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

/* =============================================
   TIME SLOT FUNCTIONS
   ============================================= */

/**
 * Loads and renders the available time slots for a given day name.
 * Looks up the day in scheduleData, splits by AM/PM, then calls
 * renderTimeSlots(). Also updates the section heading.
 * Shows a "no availability" message when the day has no slots.
 *
 * @param {string} dayName - Full day name e.g. "Friday"
 */
function loadTimeSlots(dayName) {
  // Use the per-doctor schedule if currentDoctorId is set and valid;
  // otherwise fall back to the generic scheduleData.
  const doctorSchedule = doctorSchedules[currentDoctorId];
  const slots = (doctorSchedule ? doctorSchedule[dayName] : null) || scheduleData[dayName] || [];

  // Update the "Available Times" heading with day name and full date
  const heading = document.querySelector('.available-times-heading');
  if (heading) {
    const now = new Date();
    const dateObj = new Date(now.getFullYear(), now.getMonth(), currentSelectedDate);
    const dateStr = dateObj.toLocaleDateString('en-LK', { month: 'long', day: 'numeric' });
    // Use the em-dash character consistent with the static HTML
    heading.textContent = 'Available Times \u2014 ' + dayName + ', ' + dateStr;
  }

  const morningSection = document.getElementById('morning-slots');
  const afternoonSection = document.getElementById('afternoon-slots');

  if (slots.length === 0) {
    // Hide both timeslot sections when there is no availability
    if (morningSection) morningSection.style.display = 'none';
    if (afternoonSection) afternoonSection.style.display = 'none';

    // Show (or update) a no-availability notice below the heading
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
    return;
  }

  // Remove the no-slots notice if it was shown for a previously selected day
  const prevMsg = document.getElementById('no-slots-message');
  if (prevMsg) prevMsg.remove();

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
 * Handles selection of a time slot button.
 * Deselects every other visible slot, marks the clicked one as active,
 * and updates the sidebar summary text when that element exists.
 *
 * @param {HTMLElement} slotElement - The .timeslot-btn that was clicked
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

/**
 * Initialises the calendar on profile.html.
 * 1. Attaches click (and keyboard) handlers to all .calendar-day.available cells
 * 2. On click: deselects all days, selects clicked day, loads its time slots
 * 3. Constructs a March 2024 date from the cell's text to derive the day name
 * 4. Auto-selects March 15 (Friday) so slots are visible on first page load
 */
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

    cell.textContent = day;

    if (day < today) {
      // Past days - unavailable
      cell.className = 'calendar-day unavailable';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', unavailable');
    } else if (dayName === 'Sunday') {
      // Sundays - unavailable
      cell.className = 'calendar-day unavailable';
      cell.setAttribute('aria-label', 'Sunday ' + day + ', no appointments');
    } else if (day === today) {
      // Today - selected by default
      cell.className = 'calendar-day available selected';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', today, selected');
    } else {
      // Future weekdays - available
      cell.className = 'calendar-day available';
      cell.setAttribute('aria-label', dayName + ' ' + day + ', available');
    }

    grid.appendChild(cell);
  }
}
/**
 * Sets the currently displayed doctor and reloads time slots.
 * Called from initCalendar() using the ?doctor= URL parameter.
 * Falls back to "001" (Dr. Sarah Johnson) if no parameter is found.
 * Reloads the currently selected day after changing the doctor id.
 *
 * @param {string} doctorId - Doctor id string e.g. "002"
 */
function setCurrentDoctor(doctorId) {
  // Accept only ids that exist in doctorSchedules; otherwise keep the default
  if (doctorSchedules[doctorId]) {
    currentDoctorId = doctorId;
  } else {
    currentDoctorId = '001';
  }

  // Reload the time slots for the currently highlighted calendar date
  const selectedDay = document.querySelector('.calendar-day.selected');
  let dayName = 'Friday'; // safe default
  if (selectedDay) {
    const dateNum = parseInt(selectedDay.textContent.trim(), 10);
    if (!isNaN(dateNum)) {
      const nowS = new Date();
      dayName = getDayName(new Date(nowS.getFullYear(), nowS.getMonth(), dateNum));
    }
  }
  loadTimeSlots(dayName);
}

function initCalendar() {
  // Generate the dynamic calendar for the current month before setting up handlers
  generateCalendar();
  const availableDays = document.querySelectorAll('.calendar-day.available');

  availableDays.forEach(function (dayEl) {
    // Click handler: select the date and update the time slots section
    dayEl.addEventListener('click', function () {
      // Clear selection state from every calendar cell
      const allDays = document.querySelectorAll('.calendar-day');
      allDays.forEach(function (d) {
        d.classList.remove('selected');
        d.removeAttribute('aria-selected');
      });

      // Mark this cell as the selected date
      dayEl.classList.add('selected');
      dayEl.setAttribute('aria-selected', 'true');

      // Derive the day name from the numeric date shown in the cell
      const dateNum = parseInt(dayEl.textContent.trim(), 10);
      currentSelectedDate = dateNum;
      const nowC = new Date();
      const fullDate = new Date(nowC.getFullYear(), nowC.getMonth(), dateNum);
      const dayName = getDayName(fullDate);

      loadTimeSlots(dayName);
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

/* =============================================
   INITIALISATION
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
  // Guard: only run on profile.html which contains the calendar wrapper
  const calendar = document.querySelector('.calendar-wrapper');
  if (!calendar) return;

  initCalendar();

  // Read doctor id from URL query string (?doctor=002 etc.)
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get('doctor') || '001';
  // setCurrentDoctor also triggers loadTimeSlots internally
  setCurrentDoctor(doctorId);

  // Load time slots for today on initial page load
  const todayName = new Date().toLocaleDateString('en-LK', { weekday: 'long' });
  loadTimeSlots(todayName);
});
