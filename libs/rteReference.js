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

var helper = require('../utils/helper');

var rteReferenceConfig = config.contentful.rteReference.filename,
  referneceFolderPath = path.resolve(
    config.data,
    config.contentful.rteReference.dirname
  );

if (!fs.existsSync(referneceFolderPath)) {
  mkdirp.sync(referneceFolderPath);
  helper.writeFile(path.join(referneceFolderPath, rteReferenceConfig));
}

function ExtractRteReference() {}

ExtractRteReference.prototype = {
  saveRteReference: function (entries) {
    return when.promise(function (resolve, reject) {
      var result = entries.reduce(
        (
          entry_data,
          {
            sys: {
              id,
              contentType: {
                sys: { id: name },
              },
            },
            fields,
          }
        ) => {
          Object.entries(fields).forEach(([key, value]) => {
            Object.entries(value).forEach(([lang, lang_value]) => {
              entry_data[lang.toLowerCase()] ??= {};
              entry_data[lang.toLowerCase()][id] ??= {
                uid: id,
                _content_type_uid: name
                  .replace(/([A-Z])/g, '_$1')
                  .toLowerCase(),
              };
            });
          });

          return entry_data;
        },
        {}
      );

      helper.writeFile(
        path.join(referneceFolderPath, rteReferenceConfig),
        JSON.stringify(result, null, 4)
      );
      resolve();
    });
  },
  saveAllRteReference: function () {
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
            self.saveRteReference(entries);
            resolve();
          }
        } else {
          errorLogger('no entries found');
          resolve();
        }
      } else {
        errorLogger('no entries found');
        resolve();
      }
    });
  },
  start: function () {
    var self = this;
    return when.promise(function (resolve, reject) {
      self
        .saveAllRteReference()
        .then(function () {
          resolve();
        })
        .catch(function () {
          reject();
        });
    });
  },
};

module.exports = ExtractRteReference;
