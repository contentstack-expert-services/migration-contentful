const fs = require('fs');
const path = require('path');

const config = require('../config');

var entryFolderPath = path.resolve(config.data, config.entryfolder);

// Function to recursively traverse directories
function findNestedFolders(directory) {
  try {
    const nestedFolders = [];
    const items = fs.readdirSync(directory, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(directory, item.name);

      if (item.isDirectory()) {
        nestedFolders.push(fullPath);
      }
    }

    return nestedFolders;
  } catch (error) {
    console.log(error);
  }
}

// Function to update titles in the JSON file
function updateTitlesInFile(jsonFilePath) {
  try {
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    // Create a map to track titles and their occurrences
    const titleMap = {};

    // Populate the map with titles
    for (const uid in jsonData) {
      const title = jsonData[uid].title;
      if (!titleMap[title]) {
        titleMap[title] = [];
      }
      titleMap[title].push(uid);
    }

    let updated = false;

    // Iterate over the JSON and update titles for common entries
    for (const title in titleMap) {
      if (titleMap[title].length > 1) {
        // If the title is common, update all entries with the same title
        titleMap[title].forEach((uid) => {
          jsonData[uid].title = `${jsonData[uid].title} - ${uid}`;
        });
        updated = true;
      }
    }

    // Save changes if titles were updated
    if (updated) {
      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(jsonData, null, 2),
        'utf-8'
      );
      console.log(`✅ Titles updated in file: ${jsonFilePath}`);
    }

    return updated;
  } catch (error) {
    console.error('Error updating titles in file:', error);
  }
}

// Main function
function handleDuplicateTitle() {
  return new Promise((resolve, reject) => {
    try {
      const entriesFolder = findNestedFolders(entryFolderPath);

      entriesFolder.forEach((entryFolder) => {
        try {
          const files = fs.readdirSync(entryFolder);

          // Filter out the `index.json` file
          const randomJsonFiles = files.filter(
            (file) => file !== 'index.json' && file.endsWith('.json')
          );

          if (randomJsonFiles.length === 0) {
            console.log(
              `⚠️ No JSON files found (excluding index.json) in folder: ${entryFolder}`
            );
          }

          randomJsonFiles.forEach((jsonFile) => {
            const jsonFilePath = path.join(entryFolder, jsonFile);
            updateTitlesInFile(jsonFilePath);
          });
        } catch (error) {
          reject(error);
        }
      });

      console.log('\n✅ All folders processed successfully!');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Export the function properly
module.exports = handleDuplicateTitle;
