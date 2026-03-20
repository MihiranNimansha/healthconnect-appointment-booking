/**
 * mobile-nav.js
 * HealthConnect — CM1605 Web Technology Coursework
 *
 * Toggles the mobile navigation hamburger menu.
 * Shows/hides the .nav-links list on small screens.
 *
 */

document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.querySelector('.hamburger-btn');
    var navLinks = document.querySelector('.nav-links');
    var navActions = document.querySelector('.nav-actions');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
        var isOpen = navLinks.classList.toggle('nav-open');
        hamburger.classList.toggle('is-active');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

        if (navActions) {
            navActions.classList.toggle('nav-open');
        }
    });

    // Close menu when a link is clicked (mobile UX)
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('nav-open');
            hamburger.classList.remove('is-active');
            hamburger.setAttribute('aria-expanded', 'false');
            if (navActions) navActions.classList.remove('nav-open');
        });
    });
});
