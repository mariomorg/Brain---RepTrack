/**
 * Run this with Node.js to generate placeholder icons:
 *   node generate-icons.js
 *
 * Or simply replace the files in icons/ with your own PNGs.
 * Required sizes: 16x16, 48x48, 128x128
 *
 * For now, Chrome will work fine without icons —
 * it just shows a default puzzle-piece icon.
 */

const fs = require("fs");
const { createCanvas } = require("canvas"); // npm install canvas

[16, 48, 128].forEach((size) => {
    try {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");

        // Background gradient
        const grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, "#6366f1");
        grad.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = grad;

        // Rounded rect
        const r = size * 0.18;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.fill();

        // "B" letter
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("B", size / 2, size / 2 + size * 0.03);

        const buf = canvas.toBuffer("image/png");
        fs.writeFileSync(`icons/icon${size}.png`, buf);
        console.log(`Created icon${size}.png`);
    } catch (e) {
        console.log(`Skipped icon${size}.png (install 'canvas' package to generate)`);
    }
});
