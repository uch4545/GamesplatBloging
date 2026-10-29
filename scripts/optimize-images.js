/**
 * Converts source images in assets/images to compressed WebP (<=150KB)
 * and writes assets/images/dimensions.json (used by build.js for width/height attrs).
 * Usage: node scripts/optimize-images.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'assets', 'images');
const MAX_BYTES = 150 * 1024;
const SKIP = new Set(['favicon.png']); // browser icon stays PNG
const RESIZE = { 'logo.png': { width: 240 } };

(async () => {
  const dims = {};
  for (const file of fs.readdirSync(DIR)) {
    if (!/\.(jpe?g|png)$/i.test(file) || SKIP.has(file)) continue;
    const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
    let quality = 82;
    let buf;
    do {
      let img = sharp(path.join(DIR, file));
      if (RESIZE[file]) img = img.resize(RESIZE[file]);
      buf = await img.webp({ quality, effort: 6 }).toBuffer();
      quality -= 6;
    } while (buf.length > MAX_BYTES && quality > 30);
    fs.writeFileSync(path.join(DIR, out), buf);
    const m = await sharp(buf).metadata();
    dims[out] = { width: m.width, height: m.height };
    console.log(`${file} -> ${out} ${m.width}x${m.height} ${(buf.length / 1024).toFixed(1)}KB`);
  }
  fs.writeFileSync(path.join(DIR, 'dimensions.json'), JSON.stringify(dims, null, 2));
})();
