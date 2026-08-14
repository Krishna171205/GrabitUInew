const fs = require('fs');

try {
  const imgPath = 'public/logo.jpeg';
  const svgPath = 'public/new-logo.svg';
  
  const img = fs.readFileSync(imgPath);
  const b64 = img.toString('base64');
  
  const svgContent = `<svg width="373" height="366" viewBox="0 0 373 366" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="100%" height="100%" href="data:image/jpeg;base64,${b64}" />
</svg>`;

  fs.writeFileSync(svgPath, svgContent);
  console.log('Successfully created new-logo.svg');
} catch (error) {
  console.error('Error:', error.message);
}
