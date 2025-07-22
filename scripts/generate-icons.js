const fs = require('fs');
const path = require('path');

const sizes = [192, 256, 384, 512];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="SIZE" height="SIZE">
  <rect width="512" height="512" fill="#4285f4" rx="64"/>
  <g transform="translate(256, 256)">
    <!-- Sun -->
    <circle cx="0" cy="-50" r="60" fill="#ffd700" opacity="0.9"/>
    <!-- Cloud -->
    <path d="M-80 30 Q-80 10 -60 10 Q-50 -10 -30 -10 Q-10 -20 10 -10 Q30 -10 40 10 Q60 10 60 30 Q60 50 40 50 L-60 50 Q-80 50 -80 30" fill="white" opacity="0.8"/>
  </g>
</svg>`;

// Note: In a real app, you'd use a library like sharp or canvas to convert SVG to PNG
// For now, we'll just save SVG files with different names
sizes.forEach(size => {
  const svg = svgContent.replace(/SIZE/g, size);
  const filename = path.join(__dirname, '..', 'public', `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Generated ${filename}`);
});

console.log('Icon generation complete! Note: You\'ll need to convert these SVGs to PNGs.');