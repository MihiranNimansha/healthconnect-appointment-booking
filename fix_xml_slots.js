/**
 * fix_xml_slots.js
 * Converts bare <slot>TIME</slot> elements in doctors.xml
 * to <slot time="TIME" period="PERIOD" available="true">TIME</slot>
 * so that xml-loader.js .getAttribute() calls work correctly.
 */
const fs = require('fs');
const path = 'xml/doctors.xml';

let xml = fs.readFileSync(path, 'utf8');

let count = 0;
xml = xml.replace(/<slot>(\d+:\d+ (AM|PM))<\/slot>/g, function (match, time, period) {
    count++;
    return '<slot time="' + time + '" period="' + period + '" available="true">' + time + '</slot>';
});

fs.writeFileSync(path, xml, 'utf8');
console.log('Done. Slots fixed:', count);
