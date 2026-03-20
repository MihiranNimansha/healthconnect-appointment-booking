// Dedicated page script for login.html

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailEl = document.getElementById('email');
        var passwordEl = document.getElementById('password');
        var email = emailEl ? emailEl.value.trim() : '';
        var password = passwordEl ? passwordEl.value.trim() : '';

        if (typeof Auth !== 'undefined' && Auth.login(email, password)) {
            window.location.href = 'search.html';
        }
    });
});
