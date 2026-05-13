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
  
  // Step 1: Identify all outside transparent pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        const color = intToRGBA(image.getPixelColor(x, y));
        if (color.a < 20) {
          outside[y][x] = true;
          queue.push({x, y});
        }
      }
    }
  }
  
  // Flood fill to mark ALL outside transparent pixels
  let head = 0;
  while (head < queue.length) {
    const {x, y} = queue[head++];
    const neighbors = [
      {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1}
    ];
    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && !outside[n.y][n.x]) {
        const color = intToRGBA(image.getPixelColor(n.x, n.y));
        if (color.a < 20) {
          outside[n.y][n.x] = true;
          queue.push(n);
        }
      }
    }
  }

  // Step 2: Fill internal transparent holes (like the eyes) with solid WHITE
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!outside[y][x]) {
        const color = intToRGBA(image.getPixelColor(x, y));
        // If it's a hole (transparent) inside the body, make it white
        if (color.a < 20) {
          image.setPixelColor(rgbaToInt(255, 255, 255, 255), x, y);
        }
      }
    }
  }

  // Step 3: Remove the white halo from the outside edges
  // We re-initialize the queue with the outside pixels
  const eatQueue = [];
  const eaten = Array(height).fill(0).map(() => Array(width).fill(false));
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (outside[y][x]) {
        eaten[y][x] = true;
        eatQueue.push({x, y});
      }
    }
  }

  // Flood fill to eat white/light border pixels
  head = 0;
  while (head < eatQueue.length) {
    const {x, y} = eatQueue[head++];
    
    // 8-way neighbors for eating the halo
    const neighbors = [
      {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1},
      {x: x+1, y: y+1}, {x: x-1, y: y-1}, {x: x-1, y: y+1}, {x: x+1, y: y-1}
    ];
    
    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && !eaten[n.y][n.x]) {
        const color = intToRGBA(image.getPixelColor(n.x, n.y));
        
        // If it's a white/light pixel on the edge, eat it!
        if (color.r > 200 && color.g > 200 && color.b > 200 && color.a > 0) {
          eaten[n.y][n.x] = true;
          eatQueue.push(n);
          // Set to transparent
          image.setPixelColor(rgbaToInt(0, 0, 0, 0), n.x, n.y);
        }
      }
    }
  }
  
  image.write(filepath);
  console.log(`Fixed eyes and cleaned halo for ${filename}`);
}

async function main() {
  for (const file of files) {
    await processImage(file);
  }
  console.log("All done!");
}

main();
