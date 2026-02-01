const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, 'MAINLOGO.png');

// iOS icon sizes (width x height) for different scales
const iosIconSizes = [
  { size: 20, scale: 2, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-20@2x.png' },
  { size: 20, scale: 3, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-20@3x.png' },
  { size: 29, scale: 2, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-29@2x.png' },
  { size: 29, scale: 3, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-29@3x.png' },
  { size: 40, scale: 2, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-40@2x.png' },
  { size: 40, scale: 3, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-40@3x.png' },
  { size: 60, scale: 2, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-60@2x.png' },
  { size: 60, scale: 3, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-60@3x.png' },
  { size: 1024, scale: 1, output: 'ios/maklerapp/Images.xcassets/AppIcon.appiconset/icon-1024@1x.png' },
];

// Android icon sizes (different dpi densities)
const androidIconSizes = [
  { size: 192, output: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png' },
  { size: 144, output: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png' },
  { size: 96, output: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png' },
  { size: 72, output: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png' },
  { size: 48, output: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png' },
  { size: 192, output: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png' },
  { size: 144, output: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png' },
  { size: 96, output: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png' },
  { size: 72, output: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png' },
  { size: 48, output: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png' },
];

async function generateIcons() {
  try {
    console.log('Generating iOS icons...');
    for (const icon of iosIconSizes) {
      const pixelSize = icon.size * icon.scale;
      const outputPath = path.join(__dirname, icon.output);
      await sharp(logoPath)
        .resize(pixelSize, pixelSize, { fit: 'cover' })
        .png()
        .toFile(outputPath);
      console.log(`✓ Created ${icon.output} (${pixelSize}x${pixelSize})`);
    }

    console.log('\nGenerating Android icons...');
    for (const icon of androidIconSizes) {
      const outputPath = path.join(__dirname, icon.output);
      await sharp(logoPath)
        .resize(icon.size, icon.size, { fit: 'cover' })
        .png()
        .toFile(outputPath);
      console.log(`✓ Created ${icon.output} (${icon.size}x${icon.size})`);
    }

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
