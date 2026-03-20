// Dedicated page script for profile-dashboard.html

document.addEventListener('DOMContentLoaded', function () {
    if (typeof Auth === 'undefined') return;

    if (!Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    var interval = setInterval(function () {
        if (typeof doctors !== 'undefined' && doctors.length > 0) {
            clearInterval(interval);
            renderDashboard();
        }
    }, 50);

    function renderDashboard() {
        var favIds = Auth.getFavorites();
        var favGrid = document.getElementById('favorites-grid');
        if (!favGrid) return;

        if (favIds.length === 0) {
            favGrid.innerHTML =
                '<div class="empty-state">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' +
                '<h3>No favorites yet</h3>' +
                '<p style="margin-top:10px;">Browse our directory to find and save doctors to your favorites list.</p>' +
                '<a href="search.html" class="btn-primary" style="margin-top:15px; display:inline-block;">Find Doctors</a>' +
                '</div>';
            favGrid.style.display = 'block';
            return;
        }

        favGrid.className = 'results-grid';
        favIds.forEach(function (id) {
            var doc = getDoctorById(id);
            if (!doc) return;

            var cardWrapper = document.createElement('div');
            cardWrapper.innerHTML = renderDoctorCard(doc);

            var favBtn = cardWrapper.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    Auth.toggleFavorite(doc.id);
                    cardWrapper.remove();
                    if (document.querySelectorAll('#favorites-grid .result-card').length === 0) {
                        window.location.reload();
                    }
                };
            }

            if (cardWrapper.firstElementChild) {
                favGrid.appendChild(cardWrapper.firstElementChild);
            }
        });
    }
});
