'use strict';
/**
 * External module Dependencies.
 */
var mkdirp = require('mkdirp'),
  path = require('path'),
  fs = require('fs'),
  when = require('when');

/**
 * Internal module Dependencies .
 */

const config = require('../config');
var helper = require('../utils/helper');
const chalk = require('chalk');

var entryFolderPath = path.resolve(config.data, config.entryfolder);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
}

function ExtractEntries() {}

ExtractEntries.prototype = {
  saveEntry: function (entry, prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        let localeId = helper.readFile(
          path.join(process.cwd(), config.data, 'locales', 'language.json')
        );
        
        // Use Promise.all to handle async operations properly
        await Promise.all(entry.map(async (entryData) => {
          await Promise.all(Object.values(localeId).map(async (i) => {
            const contentTypePath = path.join(
              entryFolderPath,
              entryData.sys.contentType.sys.id
                .replace(/([A-Z])/g, '_$1')
                .toLowerCase()
            );

            if (!fs.existsSync(contentTypePath)) {
              mkdirp.sync(contentTypePath);
            }

            // create JSON file in the created folders with locale name
            helper.writeFile(
              path.join(contentTypePath, `${i.code}.json`)
            );
          }));
        }));
        
        resolve();
      } catch (error) {
        console.error('Error in saveEntry:', error);
        reject(error);
      }
    });
  },
  getAllEntries: function (prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      try {
        //for reading json file and store in alldata
        var alldata = helper.readFile(config.contentful_filename);

        // to fetch all the entries from the json output
        var entries = alldata.entries;
        if (entries && entries.length > 0) {
          //run to save and extract the entries
          await self.saveEntry(entries, prefix);
          resolve();
        } else {
          console.log(chalk.red(`no entries found`));
          resolve();
        }
      } catch (error) {
        console.error('Error in getAllEntries:', error);
        reject(error);
      }
    });
  },

  start: function (prefix) {
    var self = this;
    return when.promise(async function (resolve, reject) {
      self
        .getAllEntries(prefix)
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractEntries;
