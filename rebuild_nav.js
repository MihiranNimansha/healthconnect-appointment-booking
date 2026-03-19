const fs = require('fs');

const cleanNav = {
    'about.html': `  <!-- ===== HEADER / NAVIGATION ===== -->
  <header>
    <nav aria-label="Main navigation">
      <div class="container">
        <a href="index.html" class="logo">
          <div class="logo-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <span class="logo-text">HealthConnect</span>
        </a>
        <button class="hamburger-btn" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
        </button>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="search.html">Find Doctors</a></li>
          <li><a href="index.html#services-heading">Specialties</a></li>
          <li><a href="about.html" class="active" aria-current="page">About</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
        <div class="nav-actions">
          <button class="nav-icon-btn" aria-label="Saved Doctors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#e11d48"
              stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
              </path>
            </svg>
          </button>
          <a href="#" class="btn-sign-in">Sign In</a>
          <a href="#" class="btn-primary btn-sm">Get Started</a>
        </div>
      </div>
    </nav>
  </header>`,

    'contact.html': `  <!-- ===== HEADER / NAVIGATION ===== -->
  <header>
    <nav aria-label="Main navigation">
      <div class="container">
        <a href="index.html" class="logo">
          <div class="logo-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <span class="logo-text">HealthConnect</span>
        </a>
        <button class="hamburger-btn" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
          <span class="hamburger-line" aria-hidden="true"></span>
        </button>
        <ul class="nav-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="search.html">Find Doctors</a></li>
          <li><a href="index.html#services-heading">Specialties</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="contact.html" class="active" aria-current="page">Contact</a></li>
        </ul>
        <div class="nav-actions">
          <button class="nav-icon-btn" aria-label="Saved Doctors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#e11d48"
              stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
              </path>
            </svg>
          </button>
          <a href="#" class="btn-sign-in">Sign In</a>
          <a href="#" class="btn-primary btn-sm">Get Started</a>
        </div>
      </div>
    </nav>
  </header>`
};

Object.entries(cleanNav).forEach(([file, navHtml]) => {
    let content = fs.readFileSync(file, 'utf8');

    // Match the entire header block from comment to </header>
    const headerRegex = /[ \t]*<!-- ===== HEADER \/ NAVIGATION ===== -->[\s\S]*?<\/header>/;
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, navHtml);
        fs.writeFileSync(file, content);
        console.log(`Rebuilt nav in: ${file}`);
    } else {
        console.log(`No match in: ${file}`);
    }
});
