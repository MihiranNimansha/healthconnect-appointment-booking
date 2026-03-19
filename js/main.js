/**
 * HealthConnect - Main Interactions
 * Professional UI/UX Enhancements for Viva
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Back to Top Button Logic
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 2. Intersection Observer for Scroll Animations
    // Elements with .fade-up class will animate when they enter the viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Unobserve after animating so it only happens once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Get all fade-up elements
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // 3. Hero Search Button — navigate to search.html with filter params
    const heroSearchBtn = document.getElementById('hero-search-btn');

    function doHeroSearch() {
        const specialty = (document.getElementById('hero-specialty') || {}).value || '';
        const city = (document.getElementById('hero-city') || {}).value || '';
        const avail = (document.getElementById('hero-availability') || {}).value || '';
        const price = (document.getElementById('hero-price') || {}).value || '';

        const params = new URLSearchParams();
        if (specialty) params.set('specialty', specialty);
        if (city) params.set('city', city);
        if (avail) params.set('availability', avail);
        if (price) params.set('price', price);

        const query = params.toString();
        window.location.href = 'search.html' + (query ? '?' + query : '');
    }

    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', doHeroSearch);
    }

    // Allow pressing Enter inside any hero select to trigger search
    ['hero-specialty', 'hero-city', 'hero-availability', 'hero-price'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') doHeroSearch();
            });
        }
    });
});
