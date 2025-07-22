const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [192, 256, 384, 512];

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#4285f4" rx="64"/>
  <g transform="translate(256, 256)">
    <!-- Sun -->
    <circle cx="0" cy="-50" r="60" fill="#ffd700" opacity="0.9"/>
    <!-- Cloud -->
    <path d="M-80 30 Q-80 10 -60 10 Q-50 -10 -30 -10 Q-10 -20 10 -10 Q30 -10 40 10 Q60 10 60 30 Q60 50 40 50 L-60 50 Q-80 50 -80 30" fill="white" opacity="0.8"/>
  </g>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Create a base 512x512 PNG from the SVG
  const svgBuffer = Buffer.from(svgContent);
  
  for (const size of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}x${size}.png:`, error);
    }
  }
  
  // Also create apple-touch-icon
  try {
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    console.log(`✅ Generated apple-touch-icon.png`);
  } catch (error) {
    console.error(`❌ Failed to generate apple-touch-icon.png:`, error);
  }
  
  // Create favicon.ico (32x32)
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    
    console.log(`✅ Generated favicon.png`);
  } catch (error) {
    console.error(`❌ Failed to generate favicon.png:`, error);
  }
  
  console.log('\n🎉 Icon generation complete!');
}

generateIcons().catch(console.error);