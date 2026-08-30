#!/usr/bin/env node
/**
 * Renders the 3D cup to the site's favicon set.
 *
 *   npm run build:favicon
 *
 * The cup is the brand mark, so the tab icon is an actual render of the same
 * .glb the site ships rather than a hand-drawn approximation that would drift
 * from it. A headless Chrome renders the model on a transparent background;
 * sharp then cuts the PNG sizes and an .ico.
 *
 * Framing is deliberately tighter than the on-page cup: at 16px a correctly
 * "composed" shot is four grey pixels, so the cup is pushed to fill the frame
 * and the silhouette does the work.
 *
 * Requires playwright + a local Chrome. Output is committed, so a normal
 * build/deploy never runs this.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const { CUP_MODEL_URL } = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/cup3d/model.ts'), 'utf8');
  return { CUP_MODEL_URL: src.match(/'([^']+\.glb)'/)[1] };
})();

const MIME = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html' };

const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<script type="importmap">{"imports":{"three":"/node_modules/three/build/three.module.js","three/addons/":"/node_modules/three/examples/jsm/"}}</script>
</head><body>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const S = 1024;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(S, S);
renderer.setClearAlpha(0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// The model is 2 units tall; tan(15deg) * 4.8 clears that with margin, so the
// whole cup is in frame. It gets cropped to its own bounds after the render.
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0, 4.8);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(3, 5, 4); scene.add(key);
const fill = new THREE.DirectionalLight(0xcfe0ff, 0.5); fill.position.set(-4, 1.5, 2); scene.add(fill);
const rim  = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(0, 2, -4); scene.add(rim);

// Same procedural studio environment the on-page cup uses, so the favicon's
// shading matches the hero render instead of looking flat.
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene();
const panel = (x, y, z, w, h, c, i) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c }));
  m.material.color.multiplyScalar(i); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m);
};
panel(0, 3, 2, 8, 6, 0xffffff, 2.2);
panel(-4, 1, 2, 4, 6, 0xcfe0ff, 0.9);
panel(4, 0, 2, 4, 6, 0xffffff, 0.7);
scene.environment = pmrem.fromScene(envScene, 0.04).texture;

new GLTFLoader().load(${JSON.stringify(CUP_MODEL_URL)}, (gltf) => {
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.material.metalness = 0.08;
    o.material.envMapIntensity = 0.72;
  });
  gltf.scene.scale.setScalar(1.0);
  // A hair of yaw so the wordmark reads as a curve rather than flat lettering.
  gltf.scene.rotation.y = -0.18;
  scene.add(gltf.scene);
  renderer.render(scene, camera);
  window.__done = true;
}, undefined, (e) => { window.__error = String(e); });
</script></body></html>`;

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url === '/__render.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(PAGE);
      }
      const file = path.join(ROOT, url.startsWith('/models/') ? path.join('public', url) : url);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('nope');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve({ server, port: server.address().port }));
  });
}

/** Minimal ICO container. Vista+ accepts embedded PNGs, so no BMP encoding. */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = [], blobs = [];
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
    entries.push(e); blobs.push(data); offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...blobs]);
}

(async () => {
  const { chromium } = require('playwright');
  const { server, port } = await serve();
  const browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.goto(`http://localhost:${port}/__render.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction('window.__done === true || window.__error', { timeout: 60000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(`model failed to load: ${err}`);

  const shot = await page.screenshot({ omitBackground: true });
  await browser.close();
  server.close();

  // Trim the transparent margin, then re-pad to a square so every size is
  // framed identically regardless of how the render happened to land.
  const trimmed = await sharp(shot).trim({ threshold: 1 }).toBuffer();
  const { width, height } = await sharp(trimmed).metadata();
  const side = Math.round(Math.max(width, height) * 1.06);
  const square = await sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: trimmed, gravity: 'center' }])
    .png()
    .toBuffer();

  const png = (size, bg) => {
    const img = sharp(square).resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: 'lanczos3',
    });
    // Apple homescreen icons are composited on an opaque tile; a transparent
    // PNG there renders on black, so that one size gets a white ground.
    return (bg ? img.flatten({ background: bg }) : img).png({ compressionLevel: 9 }).toBuffer();
  };

  const out = [
    ['icon-192.png', await png(192)],
    ['icon-512.png', await png(512)],
    ['apple-touch-icon.png', await png(180, { r: 255, g: 255, b: 255 })],
  ];
  for (const [name, data] of out) fs.writeFileSync(path.join(PUBLIC, name), data);

  const ico = buildIco(await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await png(size) })),
  ));
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico);

  console.log(`rendered from ${CUP_MODEL_URL}`);
  for (const [name, data] of out) console.log(`  public/${name}  ${(data.length / 1024).toFixed(1)}KB`);
  console.log(`  public/favicon.ico  ${(ico.length / 1024).toFixed(1)}KB  (16/32/48)`);
})().catch((e) => { console.error(e.message); process.exit(1); });
