const Jimp = require('jimp');

Jimp.read('assets/owen_icon_white.png').then(img => {
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
    const red   = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue  = this.bitmap.data[idx + 2];
    
    // Teal background removal: low red, higher green/blue
    if (red < 100 && (green > 80 || blue > 80)) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  return img.write('assets/owen_icon_white.png');
}).then(() => console.log('Done!')).catch(console.error);
