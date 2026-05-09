const Jimp = require('jimp');

Jimp.read('assets/owen_icon_minimal.png').then(img => {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const red   = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue  = this.bitmap.data[idx + 2];
    if (red > 240 && green > 240 && blue > 240) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  return img.write('assets/owen_icon_minimal.png');
}).then(() => console.log('Done!')).catch(console.error);
