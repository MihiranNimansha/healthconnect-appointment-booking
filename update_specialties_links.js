const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'specialties.html');

files.forEach(file => {
    let c = fs.readFileSync(file, 'utf8');
    const before = c;

    // Update all Specialties links (both in nav and footer quick links) from index.html#services-heading to specialties.html
    c = c.replace(/href="index\.html#services-heading">Specialties<\/a>/g, 'href="specialties.html">Specialties</a>');
    // Also catch the self-referencing one on index.html which uses just #services-heading
    c = c.replace(/href="#services-heading">Specialties<\/a>/g, 'href="specialties.html">Specialties</a>');

    if (c !== before) {
        fs.writeFileSync(file, c);
        console.log('Updated: ' + file);
    } else {
        console.log('No change: ' + file);
    }
});
