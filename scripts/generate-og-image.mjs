import sharp from 'sharp';

const overlay = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(15,23,42,0.15)"/>
      <stop offset="45%" stop-color="rgba(15,23,42,0.55)"/>
      <stop offset="100%" stop-color="rgba(15,23,42,0.92)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <text x="56" y="300" fill="#ffffff" font-size="50" font-weight="700" font-family="Segoe UI, Arial, sans-serif">
    <tspan x="56" dy="0">Help make a couple&apos;s dream</tspan>
    <tspan x="56" dy="58">come true</tspan>
  </text>
  <text x="56" y="430" fill="#99f6e4" font-size="34" font-weight="600" font-family="Segoe UI, Arial, sans-serif">Goal $40,000</text>
  <text x="56" y="480" fill="#e2e8f0" font-size="22" font-weight="500" font-family="Segoe UI, Arial, sans-serif">
    <tspan x="56" dy="0">Community Case Endorsed by Rabbi Maoz Harari Raful</tspan>
    <tspan x="56" dy="30">Tax Deductible</tspan>
  </text>
  <rect x="56" y="545" width="220" height="52" rx="14" fill="#0d9488"/>
  <text x="88" y="580" fill="#ffffff" font-size="26" font-weight="700" font-family="Segoe UI, Arial, sans-serif">Donate now</text>
</svg>
`;

await sharp('public/baby.jpg')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .jpeg({ quality: 90 })
  .toFile('public/og-baby.jpg');

console.log('Generated public/og-baby.jpg');
