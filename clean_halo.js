const { Jimp, intToRGBA, rgbaToInt } = require('jimp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'assets');
const files = [
  'genius_bot.png',
  'owen_blink_half.png',
  'owen_blink_closed.png',
  'owen_look_left.png',
  'owen_look_right.png',
  'owen_smile.png'
];

async function processImage(filename) {
  const filepath = path.join(assetsDir, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }
  
  const image = await Jimp.read(filepath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  
  // Create a visited matrix to track which pixels are "outside"
  const outside = Array(height).fill(0).map(() => Array(width).fill(false));
  const queue = [];
  
  // Initialize queue with all edge pixels that are transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        const color = intToRGBA(image.getPixelColor(x, y));
        if (color.a < 20) { // transparent
          outside[y][x] = true;
          queue.push({x, y});
        }
      }
    }
  }
  
  // Flood fill from outside
  while (queue.length > 0) {
    const {x, y} = queue.shift();
    
    // Check 8-way neighbors
    const neighbors = [
      {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1},
      {x: x+1, y: y+1}, {x: x-1, y: y-1}, {x: x-1, y: y+1}, {x: x+1, y: y-1}
    ];
    
    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && !outside[n.y][n.x]) {
        const color = intToRGBA(image.getPixelColor(n.x, n.y));
        
        // If the neighbor is transparent OR is near-white
        if (color.a < 20 || (color.r > 200 && color.g > 200 && color.b > 200 && color.a > 0)) {
          outside[n.y][n.x] = true;
          queue.push(n);
          
          // Make it completely transparent!
          image.setPixelColor(rgbaToInt(0, 0, 0, 0), n.x, n.y);
        }
      }
    }
  }
  
  image.write(filepath);
  console.log(`Cleaned ${filename}`);
}

async function main() {
  for (const file of files) {
    await processImage(file);
  }
  console.log("All done!");
}

main();
