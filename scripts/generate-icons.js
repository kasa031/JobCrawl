/**
 * Script to generate PWA icons from SVG source
 * Generates all required icon sizes for PWA
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

const sourceIcon = path.join(__dirname, '../frontend/public/icons/icon.svg');
const outputDir = path.join(__dirname, '../frontend/public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');
  
  if (!fs.existsSync(sourceIcon)) {
    console.error(`❌ Source icon not found: ${sourceIcon}`);
    console.log('💡 Please create icon.svg first');
    process.exit(1);
  }

  try {
    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    }
    
    console.log('\n✨ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${outputDir}`);
    console.log('\n📋 Generated icons:');
    iconSizes.forEach(size => {
      console.log(`   - icon-${size}x${size}.png`);
    });
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the script
generateIcons();

