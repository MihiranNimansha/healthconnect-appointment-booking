const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let c = fs.readFileSync(file, 'utf8');
    const before = c;
    c = c.replace(/href="#">Specialties<\/a>/g, 'href="index.html#services-heading">Specialties</a>');
    if (c !== before) {
        fs.writeFileSync(file, c);
        console.log('Fixed: ' + file);
    } else {
        console.log('No change: ' + file);
    }
});
