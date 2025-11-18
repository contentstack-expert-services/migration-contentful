const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

function ExtractContentTypes() {}

ExtractContentTypes.prototype = {
  start: function () {
    return new Promise((resolve, reject) => {
      try {
        const sourcePath = path.join(__dirname, '../utils');
        const destinationPath = path.join(process.cwd(), config.data);
        const foldersToCopy = ['global_fields'];
        foldersToCopy.forEach((folder) => {
          const sourceFolderPath = `${sourcePath}/${folder}`;
          const destinationFolderPath = `${destinationPath}/${folder}`;

          try {
            fs.copySync(sourceFolderPath, destinationFolderPath);
            // console.log(`Successfully created ${folder}`);
          } catch (err) {
            // console.error(`Error copying ${folder}: ${err}`);
          }
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = ExtractContentTypes;
