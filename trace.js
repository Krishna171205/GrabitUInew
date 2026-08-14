const ImageTracer = require('imagetracerjs');
const fs = require('fs');

ImageTracer.imageToSVG(
    'public/logo.jpeg',
    function(svgstring) {
        fs.writeFileSync('public/new-logo.svg', svgstring);
        console.log('SVG created successfully.');
    },
    { numberofcolors: 16 }
);
