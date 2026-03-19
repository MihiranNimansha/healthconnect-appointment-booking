const fs = require('fs');

let c = fs.readFileSync('index.html', 'utf8');

const marker = '<!-- ===== FOOTER ===== -->';

const cta = `<!-- ===== CTA SECTION ===== -->
  <section class="home-cta-section" aria-labelledby="cta-heading">
    <div class="container home-cta-content">
      <h2 id="cta-heading">Ready to Find Your Doctor?</h2>
      <p>Browse our network of 50+ specialists and book your appointment today.</p>
      <div class="home-cta-buttons">
        <a href="search.html" class="home-cta-btn-primary">Find Doctors</a>
        <a href="contact.html" class="home-cta-btn-outline">Contact Us</a>
      </div>
    </div>
  </section>

  `;

if (c.includes(cta.trim())) {
    console.log('CTA already injected, skipping.');
} else {
    c = c.replace(marker, cta + marker);
    fs.writeFileSync('index.html', c);
    console.log('CTA section injected successfully.');
}
