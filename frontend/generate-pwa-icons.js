const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const svgPath = path.join(__dirname, 'public', 'favicon.svg');
const svg = fs.readFileSync(svgPath);

const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
];

async function generate() {
    for (const { name, size } of sizes) {
        await sharp(svg)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, 'public', name));
        console.log(`Generated ${name} (${size}x${size})`);
    }
    // Also generate a favicon.ico equivalent as PNG
    await sharp(svg)
        .resize(32, 32)
        .png()
        .toFile(path.join(__dirname, 'public', 'favicon-32x32.png'));
    console.log('Generated favicon-32x32.png');
}

generate().catch(console.error);
