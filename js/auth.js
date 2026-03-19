/**
 * HealthConnect - Authentication & User State Management
 * Handles LocalStorage-based auth, favorites, and recent doctors.
 */

const AUTH_KEY = 'hc_user';
const FAV_KEY = 'hc_favorites';
const RECENT_KEY = 'hc_recent_doctors';

const Auth = {
    // 1. Core Auth Methods
    login: function (email, password) {
        // Simple mock authentication - accepts anything non-empty
        if (email && password) {
            const user = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                email: email,
                name: email.split('@')[0], // Generate simple name from email
                loggedInAt: new Date().toISOString()
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout: function () {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = 'index.html';
    },

    getCurrentUser: function () {
        const data = localStorage.getItem(AUTH_KEY);
        return data ? JSON.parse(data) : null;
    },

    isLoggedIn: function () {
        return this.getCurrentUser() !== null;
    },

    // 2. Favorites Management
    getFavorites: function () {
        const data = localStorage.getItem(FAV_KEY);
        return data ? JSON.parse(data) : [];
    },

    toggleFavorite: function (doctorId) {
        if (!this.isLoggedIn()) {
            this.showLoginPrompt("Please sign in to save doctors to your favorites.");
            return false;
        }

        let favorites = this.getFavorites();
        const index = favorites.indexOf(doctorId);

        if (index > -1) {
            favorites.splice(index, 1); // Remove if exists
        } else {
            favorites.push(doctorId); // Add if not exists
        }

        localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
        return true; // Successfully toggled
    },

    isFavorite: function (doctorId) {
        return this.getFavorites().includes(doctorId);
    },

    // 3. Recent Doctors Management
    getRecentDoctors: function () {
        const data = localStorage.getItem(RECENT_KEY);
        return data ? JSON.parse(data) : [];
    },

    addRecentDoctor: function (doctorObj) {
        // Expected doctorObj shape: { id, name, specialty, image }
        // We only track recent doctors if logged in, as requested "benefits of sign in"
        if (!this.isLoggedIn() || !doctorObj || !doctorObj.id) return;

        let recents = this.getRecentDoctors();

        // Remove if already exists so we can move it to the front
        recents = recents.filter(d => d.id !== doctorObj.id);

        // Add to front
        recents.unshift(doctorObj);

        // Keep only top 10
        if (recents.length > 10) {
            recents.pop();
        }

        localStorage.setItem(RECENT_KEY, JSON.stringify(recents));
    },

    // 4. UI Updates
    updateNavbar: function () {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            navActions.innerHTML = `
                <a href="profile-dashboard.html" class="nav-icon-btn" aria-label="My Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span style="font-size:0.85rem; margin-left:5px; font-weight:600;">${user.name}</span>
                </a>
                <button onclick="Auth.logout()" class="btn-outline btn-sm" style="margin-left:10px;">Sign Out</button>
            `;
        } else {
            navActions.innerHTML = `
                <button class="nav-icon-btn" aria-label="Saved Doctors" onclick="Auth.toggleFavorite('dummy')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <a href="login.html" class="btn-sign-in">Sign In</a>
                <a href="login.html" class="btn-primary btn-sm">Get Started</a>
            `;
        }
    },

    showLoginPrompt: function (customMessage = "Sign in to access this feature.") {
        // Create modal if it doesn't exist
        if (!document.getElementById('auth-modal')) {
            const modalHTML = `
            <div class="auth-modal-overlay" id="auth-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
                <div class="auth-modal">
                    <button class="auth-modal-close" id="auth-modal-close" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="auth-modal-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </div>
                    <h3 id="auth-modal-title">Sign In Required</h3>
                    <p id="auth-modal-msg">${customMessage}</p>
                    <div class="auth-modal-actions">
                        <a href="login.html" class="btn-primary">Sign In Now</a>
                        <button class="btn-outline" id="auth-modal-cancel">Maybe Later</button>
                    </div>
                </div>
            </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Bind events
            document.getElementById('auth-modal-close').addEventListener('click', this.hideLoginPrompt);
            document.getElementById('auth-modal-cancel').addEventListener('click', this.hideLoginPrompt);
            document.getElementById('auth-modal').addEventListener('click', (e) => {
                if (e.target.id === 'auth-modal') this.hideLoginPrompt();
            });
        }

        // Update message and show
        document.getElementById('auth-modal-msg').innerText = customMessage;
        const modal = document.getElementById('auth-modal');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    },

    hideLoginPrompt: function () {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    }
};

// Initialize Auth state on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNavbar();
});
