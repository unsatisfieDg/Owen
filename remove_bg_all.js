const Jimp = require('jimp');

const files = [
  'assets/owen_blink_half.png',
  'assets/owen_blink_closed.png',
  'assets/owen_writing.png',
];

Promise.all(files.map(file =>
  Jimp.read(file).then(img => {
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    return img.write(file);
  })
)).then(() => console.log('All backgrounds removed!'))
  .catch(console.error);
