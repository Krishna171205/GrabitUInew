#!/usr/bin/env node
/**
 * Builds public/models/grabbit-cup.<hash>.glb - the 3D GRABBIT cup.
 *
 *   npm run build:cup              build the model
 *   npm run build:cup -- --measure print the source scan's radius profile
 *
 * ── Why this is a lathe and not the scan ─────────────────────────────────────
 *
 * assets/grabbitcup.glb is a photogrammetry capture. Cleaned up it renders fine,
 * but it never stops looking scanned: the wall is visibly crumpled, the sleeve
 * edges wander, the lid is a faceted blob, and the printed artwork is smeared
 * across hundreds of tiny rotated UV islands that cap how sharp the wordmark can
 * ever be.
 *
 * The cup is a solid of revolution though - measured off the scan, radius varies
 * only 3-7% around any given height. So the scan is used as a *measurement*, not
 * as geometry: `--measure` prints its silhouette, PROFILE below is that
 * silhouette idealised into straight runs and deliberate corners, and the mesh is
 * lathed from it. That yields a smooth surface, crisp sleeve and lid edges, true
 * proportions, and - because the UVs become a plain cylinder - artwork that is
 * only ever as sharp as the source logo.
 *
 * Everything the cup wears is generated here: no texture comes from the scan.
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const sharp = require('sharp');

const SCAN = path.join(__dirname, '..', 'assets', 'grabbitcup.glb');
const OUT_DIR = path.join(__dirname, '..', 'public', 'models');
/**
 * The built model's filename carries a hash of its own bytes, and this generated
 * module is how the app finds it.
 *
 * A stable filename is a trap here: the .glb is rebuilt whenever the artwork
 * changes, and anything holding an earlier copy - a browser, a CDN - keeps
 * serving it against the same URL. That surfaces as the cup rendering with old
 * or mirrored artwork on someone else's machine while it looks correct locally,
 * which is not a fun thing to debug. Hashing means a changed model is simply a
 * different URL.
 */
const URL_MODULE = path.join(__dirname, '..', 'src', 'components', 'cup3d', 'model.ts');

// ── What the cup looks like ──────────────────────────────────────────────────
const BRAND = {
  blue: '#0055D4',   // --color-primary, the sleeve and lid
  paper: '#F7F7F5',  // the cup wall
  ink: '#FFFFFF',    // "grabb" and the tagline
  inkDark: '#16182E', // the "it" half of the wordmark
};

const SLEEVE = {
  /** The real wordmark, reused rather than re-typeset. See recolourWordmark. */
  logo: path.join(__dirname, '..', 'public', 'new-logo.svg'),
  tagline: 'grab it. enjoy it. repeat it.',
  /**
   * How many times the wordmark repeats around the cup. Two puts one readable
   * wordmark on whichever face you are looking at; three crowds the visible arc
   * with the tail of the neighbouring repeat.
   */
  repeats: 2,
  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
  /**
   * Embossed coffee beans, as on the printed sleeve. Rows are chosen so the
   * grid cells come out roughly square in the 4:1 sleeve band; the relief is
   * deliberately shallow, since anything deeper reads as diamond plate.
   */
  beanColumns: 14,
  beanRows: 4,
  beanRelief: 0.28,
};

const ANGULAR_SEGMENTS = 192;
/** Corners sharper than this get split into a hard edge instead of smoothed. */
const SHARP_DEGREES = 33;

const TEXTURE = {
  // 4096 across the full circumference gives each of the two wordmarks a 2048px
  // cell, so the 1131px source logo is never upscaled.
  baseColor: { width: 4096, height: 2048, quality: 90 },
  normal: { width: 2048, height: 1024, quality: 88 },
  rough: { width: 256, height: 64, quality: 85 },
};

/**
 * How the v axis of the texture is divided up. Arc length alone would spend most
 * of the map on the lid and base, which are plain colour; the sleeve is the only
 * part carrying artwork, so it gets half the texture to itself.
 *
 * The sleeve's share is not free to pick, though. Unrolled it is about 3.7 units
 * around by 0.95 tall - very nearly 4:1 - so at 4096 wide its band has to be
 * about 1024 rows for a circle to come out a circle. Give it less and everything
 * printed on it is stretched vertically on the model; that is what pushed the
 * tagline off the bottom of the band on the first attempt.
 */
const ZONES = {
  base: [0.00, 0.04],
  wall: [0.04, 0.20],
  sleeve: [0.20, 0.70],
  wall2: [0.70, 0.79],
  lid: [0.79, 1.00],
};

/**
 * The cup silhouette: [y, radius, zone], bottom centre to top centre, with the
 * base disc running outward and the top disc running back inward so that the
 * outward normal falls out of the winding. Values are the scan's own 98th
 * percentile radii (run --measure), squared up into straight runs.
 */
const PROFILE = [
  [-1.000, 0.000, 'base'],
  [-1.000, 0.395, 'base'],
  [-0.992, 0.425, 'base'],
  [-0.975, 0.436, 'base'],

  [-0.940, 0.441, 'wall'],
  [-0.800, 0.452, 'wall'],
  [-0.660, 0.462, 'wall'],
  [-0.632, 0.464, 'wall'],

  // Sleeve: steps proud of the wall, tapers with it, steps back in.
  [-0.628, 0.518, 'sleeve'],
  [-0.618, 0.537, 'sleeve'],
  [-0.400, 0.556, 'sleeve'],
  [ 0.000, 0.594, 'sleeve'],
  [ 0.260, 0.632, 'sleeve'],
  [ 0.298, 0.634, 'sleeve'],
  [ 0.307, 0.600, 'sleeve'],

  [ 0.330, 0.594, 'wall2'],
  [ 0.460, 0.602, 'wall2'],
  [ 0.570, 0.609, 'wall2'],

  // Lid: flange out, crown, then the stepped top rim.
  [ 0.596, 0.606, 'lid'],
  [ 0.606, 0.658, 'lid'],
  [ 0.628, 0.688, 'lid'],
  [ 0.665, 0.706, 'lid'],
  [ 0.706, 0.710, 'lid'],
  [ 0.760, 0.692, 'lid'],
  [ 0.818, 0.670, 'lid'],
  [ 0.836, 0.652, 'lid'],
  [ 0.845, 0.586, 'lid'],
  [ 0.870, 0.573, 'lid'],
  [ 0.930, 0.566, 'lid'],
  [ 0.972, 0.548, 'lid'],
  [ 0.992, 0.512, 'lid'],
  [ 1.000, 0.470, 'lid'],
  [ 1.000, 0.000, 'lid'],
];

const pad4 = n => (4 - (n % 4)) % 4;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

// ── Measuring the scan ───────────────────────────────────────────────────────

function readGlb(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('utf8', 0, 4) !== 'glTF') throw new Error(`${file} is not a GLB`);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const bin = buf.subarray(20 + jsonLen + 8, 20 + jsonLen + 8 + buf.readUInt32LE(20 + jsonLen));
  return { json, bin };
}

function measureScan() {
  const { json, bin } = readGlb(SCAN);
  const acc = json.accessors[json.meshes[0].primitives[0].attributes.POSITION];
  const bv = json.bufferViews[acc.bufferView];
  const copy = Buffer.from(bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength));
  const P = new Float32Array(copy.buffer, copy.byteOffset, copy.byteLength / 4);

  // The scan's own axis is offset; centre it the way the old cleanup did.
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let v = 0; v < P.length / 3; v++) {
    minX = Math.min(minX, P[v * 3]); maxX = Math.max(maxX, P[v * 3]);
    minZ = Math.min(minZ, P[v * 3 + 2]); maxZ = Math.max(maxZ, P[v * 3 + 2]);
  }
  const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;

  const N = 50, bins = Array.from({ length: N }, () => []);
  for (let v = 0; v < P.length / 3; v++) {
    const y = P[v * 3 + 1];
    bins[Math.min(N - 1, Math.floor((y + 1) / 2 * N))]
      .push(Math.hypot(P[v * 3] - cx, P[v * 3 + 2] - cz));
  }
  console.log('   y      n     r98     r50');
  bins.forEach((r, i) => {
    if (!r.length) return;
    r.sort((a, b) => a - b);
    const q = p => r[Math.min(r.length - 1, Math.floor(p * r.length))];
    const y = -1 + (i + 0.5) / N * 2;
    console.log('%s %s %s %s',
      y.toFixed(3).padStart(7),
      String(r.length).padStart(5),
      q(0.98).toFixed(3).padStart(8),
      q(0.5).toFixed(3).padStart(8));
  });
}

// ── Lathing ──────────────────────────────────────────────────────────────────

/**
 * Spins PROFILE around the Y axis.
 *
 * Normals are analytic rather than averaged from triangles: for a lathe the
 * surface normal at a profile segment is just the segment's 2D perpendicular
 * swept around, which stays exact at the poles where face averaging goes wrong.
 * A ring is emitted once where the profile bends gently (shared, so shading is
 * smooth across it) and twice where it turns a corner, which is what keeps the
 * sleeve and lid edges crisp instead of rounded off.
 */
function lathe() {
  const pts = PROFILE.map(([y, r, zone]) => ({ y, r, zone }));

  // Outward 2D normal per segment, from its direction (dr, dy) -> (dy, -dr).
  const segN = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dr = pts[i + 1].r - pts[i].r;
    const dy = pts[i + 1].y - pts[i].y;
    const len = Math.hypot(dr, dy) || 1;
    segN.push({ r: dy / len, y: -dr / len });
  }

  const cosSharp = Math.cos((SHARP_DEGREES * Math.PI) / 180);
  const rings = [];
  let hard = 0;
  for (let i = 0; i < pts.length; i++) {
    const prev = i > 0 ? segN[i - 1] : null;
    const next = i < segN.length ? segN[i] : null;
    if (prev && next) {
      const dot = prev.r * next.r + prev.y * next.y;
      if (dot >= cosSharp) {
        const r = prev.r + next.r, y = prev.y + next.y;
        const len = Math.hypot(r, y) || 1;
        rings.push({ ...pts[i], n: { r: r / len, y: y / len } });
        continue;
      }
      hard++;
      rings.push({ ...pts[i], n: prev });   // closes the previous run
      rings.push({ ...pts[i], n: next });   // opens the next one
    } else {
      rings.push({ ...pts[i], n: prev || next });
    }
  }

  // v: arc length walked, mapped into the ring's zone's slice of the texture, so
  // each zone gets the share of the map ZONES gives it. Distance is accumulated
  // across zone boundaries too, which is what gives the step faces at the sleeve
  // and lid edges a sliver of texture rather than a single stretched row. The
  // paired rings at a hard edge sit at the same point, so they contribute zero.
  const walked = {}, walkedAt = new Array(rings.length);
  for (let ri = 0; ri < rings.length; ri++) {
    const d = ri > 0 ? Math.hypot(rings[ri].r - rings[ri - 1].r, rings[ri].y - rings[ri - 1].y) : 0;
    walked[rings[ri].zone] = (walked[rings[ri].zone] || 0) + d;
    walkedAt[ri] = walked[rings[ri].zone];
  }
  for (let ri = 0; ri < rings.length; ri++) {
    const [v0, v1] = ZONES[rings[ri].zone];
    const total = walked[rings[ri].zone];
    rings[ri].v = v0 + (v1 - v0) * (total ? walkedAt[ri] / total : 0);
  }

  const cols = ANGULAR_SEGMENTS + 1; // +1 duplicates the seam column at u=1
  const positions = new Float32Array(rings.length * cols * 3);
  const normals = new Float32Array(rings.length * cols * 3);
  const uvs = new Float32Array(rings.length * cols * 2);

  for (let ri = 0; ri < rings.length; ri++) {
    const ring = rings[ri];
    for (let c = 0; c < cols; c++) {
      const u = c / ANGULAR_SEGMENTS;
      const a = u * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const o3 = (ri * cols + c) * 3, o2 = (ri * cols + c) * 2;
      positions[o3] = ring.r * ca;
      positions[o3 + 1] = ring.y;
      positions[o3 + 2] = ring.r * sa;
      normals[o3] = ring.n.r * ca;
      normals[o3 + 1] = ring.n.y;
      normals[o3 + 2] = ring.n.r * sa;
      // u runs backwards: the cup is seen from +Z, where increasing angle sweeps
      // right-to-left across the visible face, so mapping it straight through
      // prints the wordmark mirrored.
      uvs[o2] = 1 - u;
      uvs[o2 + 1] = 1 - ring.v; // glTF v runs downward
    }
  }

  const indices = [];
  for (let ri = 0; ri < rings.length - 1; ri++) {
    const a = rings[ri], b = rings[ri + 1];
    if (a.y === b.y && a.r === b.r) continue; // the duplicate ring at a hard edge
    for (let c = 0; c < ANGULAR_SEGMENTS; c++) {
      const i0 = ri * cols + c, i1 = i0 + 1;
      const i2 = (ri + 1) * cols + c, i3 = i2 + 1;
      // Degenerate at the poles, where one edge of the quad collapses to a point.
      if (a.r > 1e-6) indices.push(i0, i2, i1);
      if (b.r > 1e-6) indices.push(i1, i2, i3);
    }
  }

  console.log(`  ${rings.length} rings (${hard} hard edges) x ${ANGULAR_SEGMENTS} segments`);
  console.log(`  ${positions.length / 3} vertices, ${indices.length / 3} triangles`);
  return { positions, normals, uvs, indices: new Uint16Array(indices), rings };
}

// ── Artwork ──────────────────────────────────────────────────────────────────

/**
 * Pulls the wordmark out of public/new-logo.svg and recolours it for a blue
 * sleeve.
 *
 * That .svg is not vector art - it is a single embedded PNG, drawn for a white
 * page: "grabb" in brand blue, "it" in navy. On a blue sleeve the blue half
 * vanishes, so the blue pixels are flipped to white and the navy half is kept as
 * dark ink, which is how the printed cup reads. Alpha is preserved so the glyph
 * edges stay antialiased.
 */
async function recolourWordmark() {
  const svg = fs.readFileSync(SLEEVE.logo, 'utf8');
  const embedded = svg.match(/base64,([A-Za-z0-9+/=]+)/);
  if (!embedded) throw new Error(`no embedded bitmap in ${SLEEVE.logo}`);

  const { data, info } = await sharp(Buffer.from(embedded[1], 'base64'))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const white = hex(BRAND.ink), dark = hex(BRAND.inkDark);
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const [r, , b] = [data[i], data[i + 1], data[i + 2]];
    const target = b > 90 && b - r > 40 ? white : dark;
    data[i] = target[0]; data[i + 1] = target[1]; data[i + 2] = target[2];
  }
  return { buffer: Buffer.from(data), width: info.width, height: info.height };
}

/** The printed sleeve, unrolled: full circumference across, sleeve band down. */
async function renderSleeveArt(width, height) {
  const cell = Math.round(width / SLEEVE.repeats);
  const mark = await recolourWordmark();

  const markW = Math.round(cell * 0.56);
  const markH = Math.round(markW * (mark.height / mark.width));
  const markTop = Math.round(height * 0.20);
  const logo = await sharp(mark.buffer, { raw: { width: mark.width, height: mark.height, channels: 4 } })
    .resize(markW, markH, { kernel: 'lanczos3' }).png().toBuffer();

  const taglineSize = Math.round(height * 0.088);
  const taglineY = markTop + markH + Math.round(height * 0.115);
  const triW = Math.round(height * 0.10);
  const triY = taglineY + Math.round(height * 0.075);

  const overlay = [];
  for (let i = 0; i < SLEEVE.repeats; i++) {
    const cx = cell * i + cell / 2;
    overlay.push(
      `<text x="${cx}" y="${taglineY}" font-family="${SLEEVE.fontFamily}" font-size="${taglineSize}" font-weight="500" fill="${BRAND.ink}" text-anchor="middle">${SLEEVE.tagline}</text>`,
      `<path d="M ${cx - triW / 2} ${triY} L ${cx + triW / 2} ${triY} L ${cx} ${triY + triW * 0.62} Z" fill="none" stroke="${BRAND.ink}" stroke-width="${Math.max(2, height * 0.008)}" stroke-linejoin="round"/>`,
    );
  }

  return sharp({ create: { width, height, channels: 3, background: BRAND.blue } })
    .composite([
      ...Array.from({ length: SLEEVE.repeats }, (_, i) => ({
        input: logo, left: cell * i + Math.round((cell - markW) / 2), top: markTop,
      })),
      { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${overlay.join('')}</svg>`) },
    ])
    .png().toBuffer();
}

/**
 * Rows of coffee beans, as a greyscale height field that tiles horizontally.
 *
 * The panel each wordmark sits on is punched back out to flat. On the printed
 * cup the artwork is on a smooth patch; embossing straight through it makes the
 * lettering look like it is buckling, which is exactly how the first pass read.
 */
function beanHeightSvg(width, height) {
  const cols = SLEEVE.beanColumns, rows = SLEEVE.beanRows;
  const cw = width / cols, rh = height / rows;
  const rx = cw * 0.30, ry = rh * 0.17;
  const beans = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      // Stagger alternate rows, and wrap the extra column so the seam matches.
      const x = cw * (c + (r % 2 ? 0.5 : 0));
      const y = rh * (r + 0.5);
      const rot = (r * 37 + c * 61) % 50 - 25;
      beans.push(
        `<g transform="translate(${x} ${y}) rotate(${rot})">
           <ellipse rx="${rx}" ry="${ry}" fill="#ffffff"/>
           <path d="M ${-rx * 0.78} 0 Q 0 ${-ry * 0.55} ${rx * 0.78} 0" fill="none" stroke="#000000" stroke-width="${ry * 0.34}" stroke-linecap="round"/>
         </g>`,
      );
    }
  }

  // Fractions of one cell / of the band, matching the layout in renderSleeveArt.
  const cell = width / SLEEVE.repeats;
  // Sized so the outer bean rows clear the panel entirely - clip one and it
  // leaves a row of half-beans along the sleeve edge.
  const panels = Array.from({ length: SLEEVE.repeats }, (_, i) => {
    const x = cell * i + cell * 0.17;
    return `<rect x="${x}" y="${height * 0.17}" width="${cell * 0.66}" height="${height * 0.64}" rx="${height * 0.09}" fill="#000000"/>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="#000000"/>${beans.join('')}${panels.join('')}</svg>`;
}

/** Sobel a height field into a tangent-space normal map. */
function heightToNormal(height, width, h, strength) {
  const out = Buffer.alloc(width * h * 3);
  const at = (x, y) => height[((y + h) % h) * width + ((x + width) % width)] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < width; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * width + x) * 3;
      out[o] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      out[o + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      out[o + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
    }
  }
  return out;
}

function bandPixels(v0, v1, height) {
  // ZONES is measured from the bottom; the texture's v axis runs downward.
  const top = Math.round((1 - v1) * height);
  return { top, height: Math.max(1, Math.round((v1 - v0) * height)) };
}

async function buildBaseColor() {
  const { width, height } = TEXTURE.baseColor;
  const sleeve = bandPixels(...ZONES.sleeve, height);
  const lid = bandPixels(...ZONES.lid, height);
  const art = await renderSleeveArt(width, sleeve.height);

  return sharp({ create: { width, height, channels: 3, background: BRAND.paper } })
    .composite([
      { input: { create: { width, height: lid.height, channels: 3, background: BRAND.blue } }, top: lid.top, left: 0 },
      { input: art, top: sleeve.top, left: 0 },
    ])
    .png().toBuffer();
}

async function buildNormal() {
  const { width, height } = TEXTURE.normal;
  const sleeve = bandPixels(...ZONES.sleeve, height);

  const flat = Buffer.alloc(width * height * 3);
  for (let i = 0; i < flat.length; i += 3) { flat[i] = 128; flat[i + 1] = 128; flat[i + 2] = 255; }

  const hf = await sharp(Buffer.from(beanHeightSvg(width, sleeve.height)))
    .blur(Math.max(1, width / 900)).greyscale().raw().toBuffer();
  const beans = heightToNormal(hf, width, sleeve.height, SLEEVE.beanRelief * 12);

  return sharp(flat, { raw: { width, height, channels: 3 } })
    .composite([{ input: beans, raw: { width, height: sleeve.height, channels: 3 }, top: sleeve.top, left: 0 }])
    .png().toBuffer();
}

async function buildRoughness() {
  // glTF packs roughness in G and metalness in B. Nothing here is metal; the
  // paper wall is matte and the moulded lid and sleeve are a little glossier.
  const { width, height } = TEXTURE.rough;
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const v = 1 - y / height;
    const plastic = (v >= ZONES.sleeve[0] && v <= ZONES.sleeve[1]) || v >= ZONES.lid[0];
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 3;
      data[o] = 0;
      data[o + 1] = plastic ? 112 : 219;
      data[o + 2] = 0;
    }
  }
  return sharp(data, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

// ── Writing ──────────────────────────────────────────────────────────────────

function minMax(arr, stride) {
  const min = new Array(stride).fill(Infinity);
  const max = new Array(stride).fill(-Infinity);
  for (let i = 0; i < arr.length; i += stride) {
    for (let k = 0; k < stride; k++) {
      if (arr[i + k] < min[k]) min[k] = arr[i + k];
      if (arr[i + k] > max[k]) max[k] = arr[i + k];
    }
  }
  return { min, max };
}

(async () => {
  if (process.argv.includes('--measure')) return measureScan();

  console.log('Geometry');
  const geo = lathe();

  console.log('Textures');
  const maps = [
    ['baseColor', await buildBaseColor(), TEXTURE.baseColor],
    ['metallicRoughness', await buildRoughness(), TEXTURE.rough],
    ['normal', await buildNormal(), TEXTURE.normal],
  ];
  const images = [];
  for (const [name, png, cfg] of maps) {
    const jpg = await sharp(png).jpeg({ quality: cfg.quality, mozjpeg: true }).toBuffer();
    console.log(`  ${name}: ${cfg.width}x${cfg.height} -> ${(jpg.length / 1048576).toFixed(2)}MB`);
    images.push(jpg);
  }
  if (process.env.DUMP_TEXTURES) {
    for (let i = 0; i < maps.length; i++) {
      fs.writeFileSync(path.join(process.env.DUMP_TEXTURES, `${maps[i][0]}.png`), maps[i][1]);
    }
  }

  const parts = [
    Buffer.from(geo.indices.buffer, geo.indices.byteOffset, geo.indices.byteLength),
    Buffer.from(geo.positions.buffer, geo.positions.byteOffset, geo.positions.byteLength),
    Buffer.from(geo.uvs.buffer, geo.uvs.byteOffset, geo.uvs.byteLength),
    Buffer.from(geo.normals.buffer, geo.normals.byteOffset, geo.normals.byteLength),
    ...images,
  ];

  const chunks = [], views = [];
  let offset = 0;
  parts.forEach((data, i) => {
    views.push({
      buffer: 0, byteOffset: offset, byteLength: data.length,
      ...(i === 0 ? { target: 34963 } : i < 4 ? { target: 34962 } : {}),
    });
    chunks.push(data);
    offset += data.length;
    const pad = pad4(offset);
    if (pad) { chunks.push(Buffer.alloc(pad)); offset += pad; }
  });

  const pos = minMax(geo.positions, 3);
  const uv = minMax(geo.uvs, 2);
  const nrm = minMax(geo.normals, 3);

  const json = {
    asset: { version: '2.0', generator: 'grabitui scripts/build-cup-model.js' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'GrabbitCup' }],
    meshes: [{
      name: 'GrabbitCup',
      primitives: [{ attributes: { POSITION: 1, TEXCOORD_0: 2, NORMAL: 3 }, indices: 0, mode: 4, material: 0 }],
    }],
    materials: [{
      name: 'cup',
      pbrMetallicRoughness: {
        baseColorFactor: [1, 1, 1, 1],
        baseColorTexture: { index: 0, texCoord: 0 },
        metallicFactor: 1,
        roughnessFactor: 1,
        metallicRoughnessTexture: { index: 1, texCoord: 0 },
      },
      normalTexture: { index: 2, texCoord: 0 },
      alphaMode: 'OPAQUE',
      doubleSided: false,
    }],
    textures: [{ sampler: 0, source: 0 }, { sampler: 0, source: 1 }, { sampler: 0, source: 2 }],
    // REPEAT around the cup so the seam column joins; CLAMP up the profile so the
    // lid cannot bleed into the base.
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 33071 }],
    images: [{ mimeType: 'image/jpeg', bufferView: 4 }, { mimeType: 'image/jpeg', bufferView: 5 }, { mimeType: 'image/jpeg', bufferView: 6 }],
    accessors: [
      { bufferView: 0, byteOffset: 0, componentType: 5123, count: geo.indices.length, type: 'SCALAR' },
      { bufferView: 1, byteOffset: 0, componentType: 5126, count: geo.positions.length / 3, type: 'VEC3', min: pos.min, max: pos.max },
      { bufferView: 2, byteOffset: 0, componentType: 5126, count: geo.uvs.length / 2, type: 'VEC2', min: uv.min, max: uv.max },
      { bufferView: 3, byteOffset: 0, componentType: 5126, count: geo.normals.length / 3, type: 'VEC3', min: nrm.min, max: nrm.max },
    ],
    bufferViews: views,
    buffers: [{ byteLength: offset }],
  };

  const bin = Buffer.concat(chunks);
  let jsonStr = JSON.stringify(json);
  jsonStr += ' '.repeat(pad4(Buffer.byteLength(jsonStr)));
  const jsonBuf = Buffer.from(jsonStr, 'utf8');

  const out = Buffer.alloc(12 + 8 + jsonBuf.length + 8 + bin.length);
  let p = 0;
  out.write('glTF', p); p += 4;
  out.writeUInt32LE(2, p); p += 4;
  out.writeUInt32LE(out.length, p); p += 4;
  out.writeUInt32LE(jsonBuf.length, p); p += 4;
  out.write('JSON', p); p += 4;
  jsonBuf.copy(out, p); p += jsonBuf.length;
  out.writeUInt32LE(bin.length, p); p += 4;
  out.write('BIN\0', p); p += 4;
  bin.copy(out, p);

  const hash = crypto.createHash('sha256').update(out).digest('hex').slice(0, 8);
  const name = `grabbit-cup.${hash}.glb`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Sweep previous builds so stale hashes don't pile up in the deploy. The
  // optional group also catches the old unhashed grabbit-cup.glb, which is the
  // very file that can still be sitting in somebody's browser cache.
  for (const f of fs.readdirSync(OUT_DIR)) {
    const cleanF = path.basename(f);
    if (/^grabbit-cup(\..+)?\.glb$/.test(cleanF) && cleanF !== name) {
      // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
      fs.unlinkSync(path.join(OUT_DIR, cleanF));
    }
  }
  // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal.path-join-resolve-traversal
  fs.writeFileSync(path.join(OUT_DIR, path.basename(name)), out);

  fs.writeFileSync(URL_MODULE,
    `// Generated by scripts/build-cup-model.js - do not edit.\n` +
    `// Filename is content-hashed, so a rebuilt cup can never be shadowed by a\n` +
    `// cached copy of an older one. Run \`npm run build:cup\` to regenerate.\n` +
    `export const CUP_MODEL_URL = '/models/${name}';\n`);

  console.log(`\npublic/models/${name} ${(out.length / 1048576).toFixed(2)}MB`);
  console.log(`bounds x[${pos.min[0].toFixed(3)}, ${pos.max[0].toFixed(3)}] y[${pos.min[1].toFixed(3)}, ${pos.max[1].toFixed(3)}] z[${pos.min[2].toFixed(3)}, ${pos.max[2].toFixed(3)}]`);
})();
