const glob = require('glob');
const fs = require('fs');
const sharp = require('sharp');

const convertToWebp = () => {
  glob('public/**/*.jpg', async (err, files) => {
    if (err) {
      console.log(err);
    }
    files.forEach(async (file) => {
      const newFile = `${file.slice(0, -4)}.webp`;
      const buffer = fs.readFileSync(file);
      await sharp(buffer).resize({ fit: 'contain' }).toFormat('webp').toFile(newFile);
      console.log(`newFile: ${newFile}`);
      fs.unlinkSync(file);
      console.log(`remove ${file}`);
    });
  });
};

convertToWebp();
