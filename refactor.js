const fs = require('fs');

const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Swap Newsletter and Contact Us
    const nlRegex = /<!-- Column 3: Newsletter -->[\s\S]*?<\/form>\s*<\/div>/g;
    const matchNl = content.match(nlRegex);

    const contactRegex = /<!-- Column 4: Contact Us -->[\s\S]*?Mon-Fri:[^<]*<\/p>\s*<\/div>/g;
    const matchContact = content.match(contactRegex);

    if (matchNl && matchContact) {
        const nlText = matchNl[0];
        const contactText = matchContact[0];

        // Replace the Newsletter original location with Contact Text, and update comments
        const newContactText = contactText.replace('Column 4', 'Column 3');
        const newNlText = nlText.replace('Column 3', 'Column 4');

        content = content.replace(nlText, '%%TEMP%%');
        content = content.replace(contactText, newNlText);
        content = content.replace('%%TEMP%%', newContactText);
    }

    // 2. Update Copyright Bar
    const copyRegex = /<div class="copyright-bar">[\s\S]*?(<div class="container">)[\s\S]*?<p>&#169; 2024 HealthConnect\. All rights reserved\.<\/p>\s*<div class="copyright-links">[\s\S]*?<\/div>(\s*<\/div>\s*<\/div>)/g;

    content = content.replace(copyRegex, (match, p1, p2) => {
        return `<div class="copyright-bar">\n      ${p1}\n        <p>&#169; 2026 HealthConnect. All rights reserved. @codeMNS</p>${p2}`;
    });

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
