const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const { data, info } = await sharp('c:/Users/shriyansh Sharma/Downloads/grabitui/public/WhatsApp Image 2026-08-15 at 9.30.27 PM.jpeg').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r < 240 || g < 240 || b < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const rawW = maxX - minX + 1;
  const rawH = maxY - minY + 1;
  const pad = 16;
  const cropW = rawW + (pad * 2);
  const cropH = rawH + (pad * 2);

  const outBuf = Buffer.alloc(cropW * cropH * 4);
  const darkNavBuf = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < rawH; y++) {
    for (let x = 0; x < rawW; x++) {
      const origX = minX + x;
      const origY = minY + y;
      const outIdx = ((y + pad) * cropW + (x + pad)) * 4;
      const origIdx = (origY * width + origX) * channels;
      
      const r = data[origIdx], g = data[origIdx + 1], b = data[origIdx + 2];
      const isWhite = (r > 240 && g > 240 && b > 240);
      
      if (!isWhite) {
        const lum = (r * 0.299 + g * 0.587 + b * 0.114);
        let alpha = Math.round((255 - lum) * 1.8);
        if (alpha > 255) alpha = 255;
        if (alpha < 15) alpha = 0;

        const isBlue = b > r && b > 100;
        
        // Anti-halo: use pure target colors rather than original blended colors
        const targetR = isBlue ? 0 : 30;
        const targetG = isBlue ? 85 : 41;
        const targetB = isBlue ? 212 : 59;
        
        // Standard transparent logo
        outBuf[outIdx] = targetR;
        outBuf[outIdx + 1] = targetG;
        outBuf[outIdx + 2] = targetB;
        outBuf[outIdx + 3] = alpha;

        // Dark nav logo (white text for 'it')
        if (isBlue) {
          darkNavBuf[outIdx] = targetR;
          darkNavBuf[outIdx + 1] = targetG;
          darkNavBuf[outIdx + 2] = targetB;
        } else {
          darkNavBuf[outIdx] = 255;
          darkNavBuf[outIdx + 1] = 255;
          darkNavBuf[outIdx + 2] = 255;
        }
        darkNavBuf[outIdx + 3] = alpha;
      }
    }
  }

  const normalPng = await sharp(outBuf, { raw: { width: cropW, height: cropH, channels: 4 } }).png().toBuffer();
  fs.writeFileSync('c:/Users/shriyansh Sharma/Downloads/grabitui/public/new-logo.png', normalPng);
  
  const darkPng = await sharp(darkNavBuf, { raw: { width: cropW, height: cropH, channels: 4 } }).png().toBuffer();
  fs.writeFileSync('c:/Users/shriyansh Sharma/Downloads/grabitui/public/logo-dark-nav.png', darkPng);

  const base64Normal = normalPng.toString('base64');
  const svgContent = `<svg width="${cropW}" height="${cropH}" viewBox="0 0 ${cropW} ${cropH}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="100%" height="100%" href="data:image/png;base64,${base64Normal}"/>
</svg>`;

  fs.writeFileSync('c:/Users/shriyansh Sharma/Downloads/grabitui/public/transparent-image.svg', svgContent);
  fs.writeFileSync('c:/Users/shriyansh Sharma/Downloads/grabitui/public/new-logo.svg', svgContent);
  console.log('Successfully generated blue logos! Dimensions:', cropW, 'x', cropH);
}

run().catch(console.error);
