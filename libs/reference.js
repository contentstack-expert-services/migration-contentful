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

const config = require('../config');
var helper = require("../utils/helper");

var referenceConfig = config.contentful.reference.filename,
  referneceFolderPath = path.resolve(
    config.data,
    config.contentful.reference.dirname
  );

if (!fs.existsSync(referneceFolderPath)) {
  mkdirp.sync(referneceFolderPath);
  helper.writeFile(path.join(referneceFolderPath, referenceConfig));
}

function ExtractReference() {}

ExtractReference.prototype = {
  saveReference: function (entries) {
    return when.promise(function (resolve, reject) {
      var referenceJSON = helper.readFile(
        path.join(referneceFolderPath, referenceConfig)
      );
      for (const entry of entries) {
        var title = entry.sys.id;
        referenceJSON[title] = {
          uid: title,
          _content_type_uid: entry.sys.contentType.sys.id
            .replace(/([A-Z])/g, "_$1")
            .toLowerCase(),
        };
      }
      helper.writeFile(
        path.join(referneceFolderPath, referenceConfig),
        JSON.stringify(referenceJSON, null, 4)
      );
      resolve();
    });
  },
  saveAllReference: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      //for reading json file and store in alldata
      var alldata = helper.readFile(config.contentful_filename);

      // to fetch all the entries from the json output
      var entries = alldata.entries;
      if (entries) {
        if (entries.length > 0) {
          if (!global.filePath) {
            //run to save and excrete the entries
            self.saveReference(entries)
              .then(() => resolve())
              .catch((error) => reject(error));
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
        .saveAllReference()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractReference;
