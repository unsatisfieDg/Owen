const Jimp = require('jimp');
Jimp.read('assets/genius_bot.png').then(img => {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const red = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue = this.bitmap.data[idx + 2];
    if (red > 240 && green > 240 && blue > 240) {
      this.bitmap.data[idx + 3] = 0; // Set alpha to 0 for pure/mostly white
    }
  });
  img.write('assets/genius_bot.png');
  console.log('Background removed!');
}).catch(console.error);
