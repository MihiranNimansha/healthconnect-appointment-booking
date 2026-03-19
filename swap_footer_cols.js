const fs = require('fs');

// Both about.html and contact.html have same pattern — Newsletter before Contact Us
// Swap them so Contact Us is col-3, Newsletter is col-4 (matching index.html)

const files = ['about.html', 'contact.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Extract Newsletter block
    const nlMatch = content.match(/<!-- Column 3: Newsletter -->[\s\S]*?<\/div>\s*(?=<div class="footer-col footer-contact")/);
    // Extract Contact block
    const contactMatch = content.match(/<div class="footer-col footer-contact">[\s\S]*?Mon-Fri:[^<]*<\/p>\s*<\/div>/);

    if (nlMatch && contactMatch) {
        const nlText = nlMatch[0];
        const contactText = contactMatch[0];

        // Build the replacement: Contact first, then Newsletter
        const newContactComment = '<!-- Column 3: Contact Us -->\n                    ';
        const newNlComment = '<!-- Column 4: Newsletter -->\n                    ';

        // Remove old comment from nl block, add new ones
        const nlBody = nlText.replace('<!-- Column 3: Newsletter -->', '').trimStart();

        const swapped = newContactComment + contactText + '\n                    ' + newNlComment + nlBody;

        // Replace the original nl block + contact block with swapped version
        const fullOriginal = nlText + contactText;
        content = content.replace(fullOriginal, swapped);
        fs.writeFileSync(file, content);
        console.log(`Swapped footer columns in: ${file}`);
    } else {
        console.log(`Could not find blocks in: ${file} — not changed`);
    }
});
