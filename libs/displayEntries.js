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

const _ = require("lodash");
var helper = require("../utils/helper");

var displayEntriesConfig = config.contentful.displayEntries.filename,
  displayEntriesFolderPath = path.resolve(
    config.data,
    config.contentful.displayEntries.dirname
  );

if (!fs.existsSync(displayEntriesFolderPath)) {
  mkdirp.sync(displayEntriesFolderPath);
  helper.writeFile(path.join(displayEntriesFolderPath, displayEntriesConfig));
}

function ExtractDisplayEntries() {
  // fs.copyFile(
  //   config.contentful_filename,
  //   path.join(process.cwd(), config.data, config.json_filename),
  //   (err) => {
  //     if (err) throw console.log(err.message);
  //   }
  // );
}

ExtractDisplayEntries.prototype = {
  saveDisplayEntry: function (entries) {
    return when.promise(function (resolve, reject) {
      var displayEntryJSON = helper.readFile(
        path.join(displayEntriesFolderPath, displayEntriesConfig)
      );
      for (const entry of entries) {
        if (entry.displayField === null) {
          var title = entry.name;
          displayEntryJSON[title] = {
            displayField: "untitled",
          };
        } else {
          var title = entry.name.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
          displayEntryJSON[title] = {
            displayField: entry.displayField,
          };
        }
      }
      helper.writeFile(
        path.join(displayEntriesFolderPath, displayEntriesConfig),
        JSON.stringify(displayEntryJSON, null, 4)
      );
      resolve();
    });
  },
  saveAllDisplayEntries: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(
        path.join(config.data, config.json_filename)
      );
      // to fetch all the entries from the json output
      var entries = alldata.contentTypes;
      if (entries) {
        if (entries.length > 0) {
          if (!filePath) {
            //run to save and excrete the entries
            self.saveDisplayEntry(entries);
            resolve();
          }
        } else {
          errorLogger("no entries found");
          resolve();
        }
      } else {
        errorLogger("no entries found");
        resolve();
      }
    });
  },
  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveAllDisplayEntries()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractDisplayEntries;
