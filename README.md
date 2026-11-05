# HealthConnect

A healthcare appointment booking website for Sri Lanka. Patients can browse specialists, filter and sort them, check available time slots, book an appointment and save favourite doctors.

Built with plain **HTML5, CSS3, vanilla JavaScript (ES6) and XML**. There is no backend and no framework.

> Coursework project for **CM1605 Web Technology** (BSc (Hons) Artificial Intelligence and Data Science, IIT / Robert Gordon University).
> All doctors, hospitals and patient data are fictional sample data.

## Features

- **Doctor search and filtering**: filter by specialty, city, availability and price range at the same time, with five sort options and pagination (9 doctors per page). The home page search passes its choices to the results page through URL parameters.
- **XML-driven content**: 54 doctor profiles across 8 specialties and 15 hospitals are loaded from `xml/doctors.xml` with `XMLHttpRequest` and a `DOMParser` fallback.
- **Dynamic appointment slots**: available dates and morning/afternoon time slots are generated from each doctor's weekly schedule.
- **Booking form with JavaScript validation**: nine validated fields with live feedback on blur, all errors shown together, and a confirmation page. The booking and contact forms use `novalidate`, so HTML5 built-in validation is not relied on there. The mock sign-in form still uses the browser's built-in `required` and `type="email"` checks.
- **Mock sign-in and favourites**: `localStorage` based login, saved doctors and a dashboard of favourites.
- **Responsive and accessible UI**: skip links, ARIA labels and live regions, labelled form controls, keyboard-friendly navigation and a mobile menu.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home page with hero search and how-it-works section |
| `search.html` | Find doctors: filters, sorting, pagination |
| `specialties.html` | Browse the 8 medical specialties |
| `profile.html` | Doctor profile with calendar and time slots |
| `booking.html` | Appointment booking form |
| `confirmation.html` | Booking confirmation summary |
| `login.html` | Mock sign-in |
| `profile-dashboard.html` | Saved (favourite) doctors |
| `about.html`, `contact.html` | About page and validated contact form |

## Project structure

```
.
├── *.html          # Pages (10)
├── css/            # Stylesheets: global.css plus page-specific files
├── js/             # Scripts: validation, filtering, XML loading, time slots, auth, etc.
├── xml/doctors.xml # Doctor profiles and weekly schedules
└── images/         # Logo, favicon and doctor photos
```

## Running locally

The doctor data is loaded with `XMLHttpRequest`, which browsers block for pages opened directly from disk (`file://`). Serve the folder with any static web server instead:

```bash
# from the project folder
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Notes and limitations

- Sign-in is a front-end demo only. Any non-empty email and password will work, and nothing is sent to a server.
- Bookings are not stored anywhere. The confirmation page reads the data from browser storage.
- Only a few doctors have their own photo. The rest use a placeholder avatar.
