const fs = require('fs');
const path = require('path');

// Create a simple canvas-based icon generator
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#3182ce';
  ctx.fillRect(0, 0, size, size);

  // Inner rectangle
  const padding = size * 0.1875; // 96px for 512px icon
  const innerSize = size - (padding * 2);
  ctx.fillStyle = 'white';
  ctx.fillRect(padding, padding, innerSize, innerSize);

  // Task lines
  const lineY = padding + (innerSize * 0.2);
  const lineHeight = size * 0.047; // 24px for 512px icon
  const lineSpacing = size * 0.078; // 40px for 512px icon

  // Main task line
  ctx.fillStyle = '#3182ce';
  ctx.fillRect(padding + (innerSize * 0.1), lineY, innerSize * 0.8, lineHeight);

  // Sub task lines
  ctx.fillStyle = '#A0AEC0';
  for (let i = 1; i <= 4; i++) {
    const y = lineY + (lineSpacing * i);
    const width = innerSize * (0.6 - (i * 0.05));
    ctx.fillRect(padding + (innerSize * 0.1), y, width, lineHeight * 0.67);
  }

  // Status circles
  const circleRadius = size * 0.031; // 16px for 512px icon
  const colors = ['#48BB78', '#E53E3E', '#F6AD55', '#9F7AEA', '#38B2AC'];

  for (let i = 0; i < 5; i++) {
    const y = lineY + (lineSpacing * i);
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(padding + (innerSize * 0.9), y + (lineHeight * 0.33), circleRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
}

// Generate all icons
sizes.forEach(size => {
  const iconBuffer = generateIcon(size);
  const iconPath = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  fs.writeFileSync(iconPath, iconBuffer);
  console.log(`Generated icon: ${size}x${size}`);
});
