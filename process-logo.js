const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const { data, info } = await sharp('public/logo.jpeg').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  // Two-Zone Y Limit:
  // - Left side (X <= 300): Y <= 473 (includes full 'g' descender)
  // - Right side (X > 300): Y <= 444 (ends 'b, b, i, t' and excludes 100% of tagline)
  for (let y = 0; y <= 473; y++) {
    for (let x = 0; x < width; x++) {
      if (x > 300 && y >= 445) continue; // Exclude tagline on right side

      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r < 235 || g < 235 || b < 235) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const rawW = maxX - minX + 1;
  const rawH = maxY - minY + 1;

  // Add 16px transparent padding around canvas
  const pad = 16;
  const cropW = rawW + (pad * 2);
  const cropH = rawH + (pad * 2);

  const darkNavBuf = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < rawH; y++) {
    for (let x = 0; x < rawW; x++) {
      const origX = minX + x;
      const origY = minY + y;

      const outIdx = ((y + pad) * cropW + (x + pad)) * 4;

      // Strictly ignore any tagline pixel
      if (origX > 300 && origY >= 445) {
        darkNavBuf[outIdx] = 0;
        darkNavBuf[outIdx + 1] = 0;
        darkNavBuf[outIdx + 2] = 0;
        darkNavBuf[outIdx + 3] = 0;
        continue;
      }

      const origIdx = (origY * width + origX) * channels;
      const r = data[origIdx], g = data[origIdx + 1], b = data[origIdx + 2];
      const isWhite = (r > 240 && g > 240 && b > 240);

      if (!isWhite) {
        const bgDiff = 255 - (r * 0.299 + g * 0.587 + b * 0.114);
        const alpha = Math.min(255, Math.max(0, Math.round(bgDiff * 2.2)));

        const isOrange = (r > 150 && r > g * 1.05 && g > b * 1.2);
        if (isOrange) {
          darkNavBuf[outIdx] = r;
          darkNavBuf[outIdx + 1] = g;
          darkNavBuf[outIdx + 2] = b;
          darkNavBuf[outIdx + 3] = alpha;
        } else {
          // Cream White for letters (g, r, b, b) on dark navbar
          darkNavBuf[outIdx] = 253;
          darkNavBuf[outIdx + 1] = 251;
          darkNavBuf[outIdx + 2] = 247;
          darkNavBuf[outIdx + 3] = alpha;
        }
      }
    }
  }

  const darkPng = await sharp(darkNavBuf, { raw: { width: cropW, height: cropH, channels: 4 } }).png().toBuffer();
  fs.writeFileSync('public/logo-dark-nav.png', darkPng);

  const base64Dark = darkPng.toString('base64');
  const svgContent = `<svg width="${cropW}" height="${cropH}" viewBox="0 0 ${cropW} ${cropH}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="100%" height="100%" href="data:image/png;base64,${base64Dark}"/>
</svg>`;

  fs.writeFileSync('public/transparent-image.svg', svgContent);
  fs.writeFileSync('public/new-logo.svg', svgContent);
  console.log('Successfully generated two-zone logo! Dimensions:', cropW, 'x', cropH);
}

run().catch(console.error);
