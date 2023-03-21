"use strict";
/**
 * External module Dependencies.
 */
var mkdirp = require("mkdirp"),
  path = require("path"),
  fs = require("fs"),
  when = require("when");

/**
 * Internal module Dependencies .
 */

var helper = require("../utils/helper");

var entryFolderPath = path.resolve(config.data, config.entryfolder);

if (!fs.existsSync(entryFolderPath)) {
  mkdirp.sync(entryFolderPath);
}

function ExtractEntries() {}

ExtractEntries.prototype = {
  saveEntry: function (entry, prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      let localeId = helper.readFile(
        path.join(process.cwd(), "csMigrationData/language/language.json")
      );
      entry.map((entryData) => {
        Object.values(localeId).forEach(async (i) => {
          //check if file exist or not
          if (
            !fs.existsSync(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase()
              )
            )
          ) {
            // create folder with the content type name
            mkdirp.sync(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase()
              )
            );
            // create JSON file in the created folders with locale name
            helper.writeFile(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase(),
                `${i.code}.json`
              )
            );
          } else {
            mkdirp.sync(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase()
              )
            );
            // create JSON file in the created folders with locale name
            helper.writeFile(
              path.join(
                entryFolderPath,
                entryData.sys.contentType.sys.id
                  .replace(/([A-Z])/g, "_$1")
                  .toLowerCase(),
                `${i.code}.json`
              )
            );
          }
        });
      });
    });
  },
  getAllEntries: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(config.contentful_filename);

      // to fetch all the entries from the json output
      var entries = alldata.entries;
      if (entries) {
        if (entries.length > 0) {
          if (!filePath) {
            //run to save and excrete the entries
            self.saveEntry(entries, prefix);
            resolve();
          }
        } else {
          console.log(chalk.red(`no entries found`));
          resolve();
        }
      } else {
        console.log(chalk.red(`no entries found`));
        resolve();
      }
    });
  },

  start: function (prefix) {
    var self = this;
    return when.promise(function (resolve, reject) {
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
