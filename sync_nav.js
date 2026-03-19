const fs = require('fs');

// The canonical nav logo from index.html — using logo-icon-box with SVG
const logoBlock = `        <a href="index.html" class="logo">
          <div class="logo-icon-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <span class="logo-text">HealthConnect</span>
        </a>`;

// Old logo patterns to detect
const oldLogoPatterns = [
    // 2-space indentation (used in search.html, booking.html, profile.html, confirmation.html)
    `        <a href="index.html" class="logo">
          <span class="logo-icon" aria-hidden="true"></span>
          HealthConnect
        </a>`,
    // 4-space indentation (used in about.html, contact.html)
    `                <a href="index.html" class="logo">
                    <span class="logo-icon" aria-hidden="true"></span>
                    HealthConnect
                </a>`,
];

// Canonical nav-actions (with heart icon)
const navActionsBlock = `        <div class="nav-actions">
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
        </div>`;

// Old nav-actions patterns
const oldNavActionsPatterns = [
    // missing heart icon (2-space indent)
    `        <div class="nav-actions">
          <a href="#" class="btn-sign-in">Sign In</a>
          <a href="#" class="btn-primary">Get Started</a>
        </div>`,
    // missing heart icon + btn-sm (4-space indent)
    `                <div class="nav-actions">
                    <a href="#" class="btn-sign-in">Sign In</a>
                    <a href="#" class="btn-primary">Get Started</a>
                </div>`,
    // 4-space indent with btn-sm
    `                <div class="nav-actions">
                    <a href="#" class="btn-sign-in">Sign In</a>
                    <a href="#" class="btn-primary btn-sm">Get Started</a>
                </div>`,
];

// Also fix about.html / contact.html nav-links which use 4-space indent
// Canonical nav-links (2-space indent, page-specific active states handled per-file)

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix logo
    for (const pattern of oldLogoPatterns) {
        if (content.includes(pattern)) {
            content = content.replace(pattern, logoBlock);
            changed = true;
            break;
        }
    }

    // Fix also about.html / contact.html indented logo-icon with SVG already added from previous pass
    // These might have <span class="logo-icon" aria-hidden="true"> then SVG then </span> — keep if correct
    // Actually, these pages had old logo-icon with empty span replaced with svg earlier
    // The old pattern with 4-spaces and no logo-icon-box still needs catching:
    const altLogoWith4Spaces = content.match(/<a href="index\.html" class="logo">\s*<span class="logo-icon" aria-hidden="true">[\s\S]{0,200}?<\/span>\s*[\n\r\s]*HealthConnect[\n\r\s]*<\/a>/);
    if (altLogoWith4Spaces) {
        content = content.replace(altLogoWith4Spaces[0], logoBlock);
        changed = true;
    }

    // Fix nav-actions
    for (const pattern of oldNavActionsPatterns) {
        if (content.includes(pattern)) {
            content = content.replace(pattern, navActionsBlock);
            changed = true;
            break;
        }
    }

    // Also catch about.html 4-space nav-actions variants
    const navActionsMatch = content.match(/<div class="nav-actions">[\s\S]*?<\/div>\s*(?=\s*<\/div>\s*<\/nav>)/);
    if (navActionsMatch) {
        const block = navActionsMatch[0];
        // If it's missing the nav-icon-btn, replace
        if (!block.includes('nav-icon-btn') && !block.includes('Saved Doctors')) {
            content = content.replace(block, navActionsBlock);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    } else {
        console.log(`Skip:    ${file} (nothing to change)`);
    }
});

console.log('\nAll done!');
