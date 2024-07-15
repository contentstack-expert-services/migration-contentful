const fs = require('fs-extra');
const path = require('path');

function ExtractContentTypes() {}

ExtractContentTypes.prototype = {
  start: function () {
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
  },
};

module.exports = ExtractContentTypes;
