const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const text = 'Hello World';
const fontSize = 233;

// Set the canvas width and height based on the text and font size
canvas.width = 2000;
canvas.height = 1000;
ctx.font = `${fontSize}px Monospace`;

// Calculate the half point of the canvas width
const halfWidth = canvas.width / 2;

// Render each character with custom colors
let xOffset = 0;
for (let i = 0; i < text.length; i++) {
  const ch = text.charAt(i);

  // Calculate the position of the character
  const metrics = ctx.measureText(ch);
  console.log(metrics);
  //const charWidth = metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
  const charWidth = metrics.width;
  const charHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const x = xOffset + (charWidth / 2);

  // Set the gradient for the character
  const gradient = ctx.createLinearGradient(x, 0, x + charWidth, 0);
  gradient.addColorStop(0, 'black');
  gradient.addColorStop(0.5, 'black');
  gradient.addColorStop(0.5, 'red');
  gradient.addColorStop(1, 'red');

  // Apply the gradient to the character
  ctx.fillStyle = gradient;
  ctx.fillText(ch, x, fontSize);
  ctx.strokeRect(x, fontSize, charWidth, -charHeight);

  // Update the x offset for the next character
  xOffset += charWidth;
}
